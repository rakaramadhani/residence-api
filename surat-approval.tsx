"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, 
  Calendar, 
  User, 
  CheckCircle, 
  XCircle, 
  Clock,
  Download 
} from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { fetchSurat, updateSuratStatus, Surat } from "./fetcher";

export function SuratApprovalCenter() {
  const [suratPending, setSuratPending] = useState<Surat[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSurat, setSelectedSurat] = useState<Surat | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    loadSuratPending();
  }, []);

  const loadSuratPending = async () => {
    try {
      const suratData = await fetchSurat();
      const pending = suratData.filter(surat => surat.status === "requested");
      setSuratPending(pending);
    } catch (error) {
      console.error("Error loading surat:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (surat: Surat) => {
    setSelectedSurat(surat);
    setFeedback("");
    setShowDetailModal(true);
  };

  const handleApprove = async (surat: Surat) => {
    const result = await Swal.fire({
      title: 'Setujui Permohonan',
      text: `Apakah Anda yakin ingin menyetujui permohonan surat dari ${surat.user.username || surat.user.email}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Setujui!',
      cancelButtonText: 'Batal'
    });

    if (!result.isConfirmed) return;

    setActionLoading(true);
    try {
      const response = await updateSuratStatus(surat.id, "approved", feedback);
      
      if (response.success) {
        Swal.fire("Berhasil!", "Permohonan surat telah disetujui", "success");
        await loadSuratPending();
        setShowDetailModal(false);
      } else {
        Swal.fire("Error", "Gagal menyetujui permohonan", "error");
      }
    } catch (error) {
      console.error("Error approving surat:", error);
      Swal.fire("Error", "Terjadi kesalahan saat menyetujui permohonan", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (surat: Surat) => {
    if (!feedback.trim()) {
      Swal.fire("Error", "Alasan penolakan harus diisi", "error");
      return;
    }

    const result = await Swal.fire({
      title: 'Tolak Permohonan',
      text: `Apakah Anda yakin ingin menolak permohonan surat dari ${surat.user.username || surat.user.email}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Tolak!',
      cancelButtonText: 'Batal'
    });

    if (!result.isConfirmed) return;

    setActionLoading(true);
    try {
      const response = await updateSuratStatus(surat.id, "rejected", feedback);
      
      if (response.success) {
        Swal.fire("Berhasil!", "Permohonan surat telah ditolak", "success");
        await loadSuratPending();
        setShowDetailModal(false);
      } else {
        Swal.fire("Error", "Gagal menolak permohonan", "error");
      }
    } catch (error) {
      console.error("Error rejecting surat:", error);
      Swal.fire("Error", "Terjadi kesalahan saat menolak permohonan", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Persetujuan Surat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-500">Memuat data surat...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Persetujuan Surat
            {suratPending.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {suratPending.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {suratPending.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Tidak ada permohonan surat yang menunggu</p>
            </div>
          ) : (
            <div className="space-y-3">
              {suratPending.slice(0, 5).map((surat) => (
                <div key={surat.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{surat.user.username || surat.user.email}</span>
                      {surat.user.cluster && (
                        <Badge variant="outline" className="text-xs">
                          {surat.user.cluster}
                        </Badge>
                      )}
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="text-sm">
                      <span className="font-medium">Keperluan: </span>
                      <span className="text-gray-700">{surat.keperluan}</span>
                    </div>
                    
                    {surat.fasilitas && (
                      <div className="text-sm">
                        <span className="font-medium">Fasilitas: </span>
                        <span className="text-gray-700">{surat.fasilitas}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Mulai: {formatDate(surat.tanggalMulai)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Selesai: {formatDate(surat.tanggalSelesai)}</span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-400">
                      Diajukan: {formatDateTime(surat.createdAt)}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewDetail(surat)}
                      className="flex-1"
                    >
                      Lihat Detail
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleApprove(surat)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      disabled={actionLoading}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Setujui
                    </Button>
                  </div>
                </div>
              ))}

              {suratPending.length > 5 && (
                <div className="text-center pt-2">
                  <p className="text-sm text-gray-500">
                    Dan {suratPending.length - 5} permohonan lainnya...
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Permohonan Surat</DialogTitle>
            <DialogDescription>
              Review dan tindak lanjuti permohonan surat
            </DialogDescription>
          </DialogHeader>
          
          {selectedSurat && (
            <div className="space-y-4">
              {/* User Info */}
              <div className="p-3 bg-gray-50 rounded">
                <div className="font-medium">{selectedSurat.user.username || selectedSurat.user.email}</div>
                <div className="text-sm text-gray-600">{selectedSurat.user.email}</div>
                {selectedSurat.user.phone && (
                  <div className="text-sm text-gray-600">{selectedSurat.user.phone}</div>
                )}
                <div className="text-sm text-gray-600">
                  {selectedSurat.user.cluster} 
                  {selectedSurat.user.nomor_rumah && ` - No. ${selectedSurat.user.nomor_rumah}`}
                </div>
              </div>

              {/* Request Details */}
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Keperluan</Label>
                  <p className="text-sm text-gray-700 mt-1">{selectedSurat.keperluan}</p>
                </div>

                {selectedSurat.fasilitas && (
                  <div>
                    <Label className="text-sm font-medium">Fasilitas</Label>
                    <p className="text-sm text-gray-700 mt-1">{selectedSurat.fasilitas}</p>
                  </div>
                )}

                {selectedSurat.deskripsi && (
                  <div>
                    <Label className="text-sm font-medium">Deskripsi</Label>
                    <p className="text-sm text-gray-700 mt-1">{selectedSurat.deskripsi}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium">Tanggal Mulai</Label>
                    <p className="text-sm text-gray-700 mt-1">{formatDate(selectedSurat.tanggalMulai)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Tanggal Selesai</Label>
                    <p className="text-sm text-gray-700 mt-1">{formatDate(selectedSurat.tanggalSelesai)}</p>
                  </div>
                </div>
              </div>

              {/* Feedback Section */}
              <div>
                <Label htmlFor="feedback">Catatan/Feedback (Opsional)</Label>
                <Textarea 
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Berikan catatan atau alasan jika diperlukan..."
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
              Tutup
            </Button>
            <Button 
              variant="destructive"
              onClick={() => selectedSurat && handleReject(selectedSurat)}
              disabled={actionLoading}
            >
              <XCircle className="h-4 w-4 mr-1" />
              {actionLoading ? "Memproses..." : "Tolak"}
            </Button>
            <Button 
              onClick={() => selectedSurat && handleApprove(selectedSurat)}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              {actionLoading ? "Memproses..." : "Setujui"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 