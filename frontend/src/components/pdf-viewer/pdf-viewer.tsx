import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Alert,
  Skeleton,
  Tooltip,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DownloadIcon from "@mui/icons-material/Download";
import { useTranslation } from "react-i18next";

type PdfViewerProps = {
  url: string;
  title?: string;
  height?: number;
};

export default function PdfViewer({ url, title, height = 800 }: PdfViewerProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => setLoading(false);
  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  return (
    <Paper variant="outlined" sx={{ overflow: "hidden" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {title || t('PDF Viewer')}
        </Typography>
        <Box>
          <Tooltip title={t('Download')}>
            <IconButton size="small" component="a" href={url} download>
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('Open in new tab')}>
            <IconButton size="small" component="a" href={url} target="_blank" rel="noopener noreferrer">
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {loading && (
        <Skeleton variant="rectangular" height={height} animation="wave" />
      )}

      {error ? (
        <Alert severity="error" sx={{ m: 2 }}>
          {t('Failed to load PDF')}
        </Alert>
      ) : (
        <Box
          component="iframe"
          src={url}
          onLoad={handleLoad}
          onError={handleError}
          sx={{
            width: "100%",
            height,
            border: "none",
            display: error ? "none" : "block",
          }}
        />
      )}
    </Paper>
  );
}
