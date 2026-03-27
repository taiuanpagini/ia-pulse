import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Skeleton from "@mui/material/Skeleton";

function CardSkeleton() {
  return (
    <Box
      sx={{
        borderRadius: "12px",
        border: "1px solid #E5E7EB",
        borderLeft: "3px solid #E5E7EB",
        bgcolor: "#fff",
        p: 2.5,
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Skeleton variant="rounded" width={72} height={20} sx={{ borderRadius: "100px" }} />
        <Skeleton variant="rounded" width={54} height={20} sx={{ borderRadius: "100px" }} />
      </Box>
      <Skeleton variant="text" sx={{ fontSize: "0.875rem" }} />
      <Skeleton variant="text" sx={{ fontSize: "0.875rem" }} width="90%" />
      <Skeleton variant="text" sx={{ fontSize: "0.875rem" }} width="70%" />
      <Box sx={{ display: "flex", gap: 1, mt: "auto" }}>
        <Skeleton variant="text" width={60} sx={{ fontSize: "0.72rem" }} />
        <Skeleton variant="text" width={80} sx={{ fontSize: "0.72rem" }} />
      </Box>
    </Box>
  );
}

export default function Loading() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>

      {/* Hero skeleton */}
      <Box sx={{ bgcolor: "#121212", pt: { xs: 4, sm: 5 }, pb: { xs: 5, sm: 6 } }}>
        <Container maxWidth="lg">
          <Stack spacing={3.5}>
            {/* Logo */}
            <Stack direction="row" alignItems="center" spacing={1.75}>
              <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: "14px", bgcolor: "rgba(255,255,255,0.08)" }} />
              <Box>
                <Skeleton variant="text" width={120} height={28} sx={{ bgcolor: "rgba(255,255,255,0.08)" }} />
                <Skeleton variant="text" width={200} height={14} sx={{ bgcolor: "rgba(255,255,255,0.05)" }} />
              </Box>
            </Stack>
            {/* Stats pills */}
            <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
              {[100, 90, 80, 70].map((w) => (
                <Skeleton key={w} variant="rounded" width={w} height={34} sx={{ borderRadius: "100px", bgcolor: "rgba(255,255,255,0.07)" }} />
              ))}
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Content skeleton */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={3}>
          {/* Filters */}
          <Skeleton variant="rounded" height={56} sx={{ borderRadius: "12px" }} />
          {/* Tabs */}
          <Skeleton variant="rounded" height={52} sx={{ borderRadius: "12px" }} />

          {/* Cards grid */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5, pb: 2, borderBottom: "1px solid #E5E7EB" }}>
              <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: "10px" }} />
              <Skeleton variant="text" width={140} height={20} />
              <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: "100px", ml: "auto" }} />
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
              {Array.from({ length: 9 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </Box>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
