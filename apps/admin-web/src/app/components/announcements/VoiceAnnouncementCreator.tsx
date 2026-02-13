// ============================================================================
// FILE: src/app/components/announcements/VoiceAnnouncementCreator.tsx
// PURPOSE: Component for creating and sending voice announcements
// ============================================================================

import { useState, useRef, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  IconButton,
  LinearProgress,
  Chip,
  Stack,
} from "@mui/material";
import {
  Mic,
  Stop,
  PlayArrow,
  Pause,
  Delete,
  Send,
  CloudUpload,
  Check,
} from "@mui/icons-material";
import {
  useUploadAudio,
  useCreateAnnouncement,
  useSendAnnouncement,
} from "@/app/services/voiceAnnouncements.hooks";
import {
  AnnouncementPriority,
  type VoiceAnnouncementCreate,
} from "@/app/services/voiceAnnouncements.schema";

// ============================================================================
// TYPES
// ============================================================================

interface VoiceAnnouncementCreatorProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function VoiceAnnouncementCreator({
  open,
  onClose,
  onSuccess,
}: VoiceAnnouncementCreatorProps) {
  // State
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1=Record, 2=Details, 3=Send
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [createdAnnouncementId, setCreatedAnnouncementId] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: AnnouncementPriority.Medium,
    targetGrades: [] as number[],
  });

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Mutations
  const uploadMutation = useUploadAudio();
  const createMutation = useCreateAnnouncement();
  const sendMutation = useSendAnnouncement();

  // ============================================================================
  // RECORDING FUNCTIONS
  // ============================================================================

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Try to use mp4 format first, fallback to webm if not supported
      let mimeType = "audio/mp4";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/webm;codecs=opus";
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/webm";
      }
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mimeType,
        });
        setRecordedBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
    } catch (err: any) {
      setError("Failed to access microphone. Please check permissions.");
      console.error("Recording error:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playAudio = () => {
    if (audioUrl && audioPlayerRef.current) {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseAudio = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    }
  };

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setRecordedBlob(null);
    setAudioUrl("");
    setUploadedFileUrl("");
    setIsPlaying(false);
  };

  // ============================================================================
  // FORM HANDLERS
  // ============================================================================

  const handleUploadAudio = async () => {
    if (!recordedBlob) {
      setError("No recording found");
      return;
    }

    try {
      setError(null);
      const extension = recordedBlob.type.includes('mp4') ? 'mp4' : 'webm';
      const file = new File([recordedBlob], `announcement_${Date.now()}.${extension}`, {
        type: recordedBlob.type,
      });

      const result = await uploadMutation.mutateAsync(file);
      setUploadedFileUrl(result.file_url);
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Failed to upload audio");
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!formData.title || !uploadedFileUrl) {
      setError("Please provide title and audio");
      return;
    }

    try {
      setError(null);
      const announcementData: VoiceAnnouncementCreate = {
        title: formData.title,
        description: formData.description,
        audio_file_url: uploadedFileUrl,
        priority: formData.priority,
        target_audience: {
          grades: formData.targetGrades,
          all_teachers: formData.targetGrades.length === 0,
        },
      };

      const result = await createMutation.mutateAsync(announcementData);
      setCreatedAnnouncementId(result.id);
      setStep(3);
    } catch (err: any) {
      setError(err.message || "Failed to create announcement");
    }
  };

  const handleSendAnnouncement = async () => {
    if (!createdAnnouncementId) {
      setError("No announcement created");
      return;
    }

    try {
      setError(null);
      const result = await sendMutation.mutateAsync(createdAnnouncementId);
      
      // Success!
      if (onSuccess) {
        onSuccess();
      }
      handleClose();
    } catch (err: any) {
      setError(err.message || "Failed to send announcement");
    }
  };

  const handleClose = () => {
    deleteRecording();
    setStep(1);
    setFormData({
      title: "",
      description: "",
      priority: AnnouncementPriority.Medium,
      targetGrades: [],
    });
    setCreatedAnnouncementId(null);
    setError(null);
    onClose();
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderStep1 = () => (
    <Box>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Record a voice announcement to send to teachers
      </Typography>

      <Paper
        elevation={2}
        sx={{
          p: 3,
          mt: 2,
          textAlign: "center",
          bgcolor: isRecording ? "error.light" : "background.paper",
          transition: "all 0.3s",
        }}
      >
        {!recordedBlob ? (
          <Box>
            <IconButton
              onClick={isRecording ? stopRecording : startRecording}
              sx={{
                width: 80,
                height: 80,
                bgcolor: isRecording ? "error.main" : "primary.main",
                color: "white",
                "&:hover": {
                  bgcolor: isRecording ? "error.dark" : "primary.dark",
                },
                mb: 2,
              }}
            >
              {isRecording ? <Stop sx={{ fontSize: 40 }} /> : <Mic sx={{ fontSize: 40 }} />}
            </IconButton>
            <Typography variant="h6" gutterBottom>
              {isRecording ? "Recording..." : "Tap to Record"}
            </Typography>
            {isRecording && (
              <Typography variant="caption" color="error.main">
                Recording in progress - tap stop when done
              </Typography>
            )}
          </Box>
        ) : (
          <Box>
            <Chip label="Recording Complete" color="success" sx={{ mb: 2 }} />
            <audio
              ref={audioPlayerRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              style={{ display: "none" }}
            />
            <Stack direction="row" spacing={2} justifyContent="center">
              <IconButton onClick={isPlaying ? pauseAudio : playAudio} color="primary">
                {isPlaying ? <Pause /> : <PlayArrow />}
              </IconButton>
              <IconButton onClick={deleteRecording} color="error">
                <Delete />
              </IconButton>
            </Stack>
          </Box>
        )}
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );

  const renderStep2 = () => (
    <Box>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Add details for your voice announcement
      </Typography>

      <Stack spacing={2} sx={{ mt: 2 }}>
        <TextField
          label="Announcement Title"
          fullWidth
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Important Staff Meeting"
        />

        <TextField
          label="Description (Optional)"
          fullWidth
          multiline
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Add any additional details..."
        />

        <FormControl fullWidth>
          <InputLabel>Priority</InputLabel>
          <Select
            value={formData.priority}
            label="Priority"
            onChange={(e) =>
              setFormData({ ...formData, priority: e.target.value as AnnouncementPriority })
            }
          >
            <MenuItem value={AnnouncementPriority.Low}>Low</MenuItem>
            <MenuItem value={AnnouncementPriority.Medium}>Medium</MenuItem>
            <MenuItem value={AnnouncementPriority.High}>High</MenuItem>
            <MenuItem value={AnnouncementPriority.Urgent}>🔴 Urgent</MenuItem>
          </Select>
        </FormControl>

        <Alert severity="info">
          This announcement will be sent to all teachers in your school via push notification.
        </Alert>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );

  const renderStep3 = () => (
    <Box>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Review and send your announcement
      </Typography>

      <Paper elevation={2} sx={{ p: 2, mt: 2 }}>
        <Stack spacing={1}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Title
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {formData.title}
            </Typography>
          </Box>

          {formData.description && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Description
              </Typography>
              <Typography variant="body2">{formData.description}</Typography>
            </Box>
          )}

          <Box>
            <Typography variant="caption" color="text.secondary">
              Priority
            </Typography>
            <Chip
              label={formData.priority.toUpperCase()}
              size="small"
              color={
                formData.priority === AnnouncementPriority.Urgent
                  ? "error"
                  : formData.priority === AnnouncementPriority.High
                  ? "warning"
                  : "default"
              }
            />
          </Box>
        </Stack>
      </Paper>

      <Alert severity="warning" sx={{ mt: 2 }}>
        Once sent, this voice announcement will ring all teachers' phones immediately. This action
        cannot be undone.
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {sendMutation.isSuccess && (
        <Alert severity="success" sx={{ mt: 2 }} icon={<Check />}>
          Announcement sent successfully! Teachers will receive notifications now.
        </Alert>
      )}
    </Box>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Voice Announcement</Typography>
          <Chip label={`Step ${step} of 3`} size="small" />
        </Box>
      </DialogTitle>

      <DialogContent>
        {uploadMutation.isPending || createMutation.isPending || sendMutation.isPending ? (
          <Box sx={{ py: 3, textAlign: "center" }}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {uploadMutation.isPending && "Uploading audio..."}
              {createMutation.isPending && "Creating announcement..."}
              {sendMutation.isPending && "Sending to teachers..."}
            </Typography>
          </Box>
        ) : (
          <>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>

        {step === 1 && (
          <Button
            variant="contained"
            onClick={handleUploadAudio}
            disabled={!recordedBlob || uploadMutation.isPending}
            startIcon={<CloudUpload />}
          >
            Continue
          </Button>
        )}

        {step === 2 && (
          <>
            <Button onClick={() => setStep(1)}>Back</Button>
            <Button
              variant="contained"
              onClick={handleCreateAnnouncement}
              disabled={!formData.title || createMutation.isPending}
            >
              Next
            </Button>
          </>
        )}

        {step === 3 && (
          <>
            <Button onClick={() => setStep(2)} disabled={sendMutation.isPending}>
              Back
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleSendAnnouncement}
              disabled={sendMutation.isPending || sendMutation.isSuccess}
              startIcon={<Send />}
            >
              Send Now
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
