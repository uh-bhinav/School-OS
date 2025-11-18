import { Box, Typography, Card, CardContent } from '@mui/material';
import { PhotoLibrary } from '@mui/icons-material';

export default function AlbumsPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <PhotoLibrary sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4" fontWeight="bold">
          Albums
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Coming Soon
          </Typography>
          <Typography color="text.secondary">
            The Albums module is currently under development. This page will allow you to:
          </Typography>
          <Box component="ul" sx={{ mt: 2 }}>
            <li>Create and manage photo albums</li>
            <li>Upload and organize event photos</li>
            <li>Share albums with students and parents</li>
            <li>Set album permissions and visibility</li>
            <li>Tag students in photos</li>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
