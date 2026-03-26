import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";

interface CriteriaInputProps {
  name: string;
  label: string;
  description: string;
  isInverted: boolean;
  value?: number;
  onChange: (v: number) => void;
}

const OPTIONS = [1, 2, 3, 4, 5];

// Escala direta: 5=melhor (facilidade de adoção alta = bom)
const ADOPTION_LABELS: Record<number, string> = {
  1: "Muito complexa",
  2: "Complexa",
  3: "Moderada",
  4: "Pouco complexa",
  5: "Muito simples",
};

const NORMAL_LABELS: Record<number, string> = {
  1: "Muito baixo",
  2: "Baixo",
  3: "Médio",
  4: "Alto",
  5: "Muito alto",
};

export function CriteriaInput({
  label,
  description,
  isInverted,
  value,
  onChange,
}: CriteriaInputProps) {
  const tooltipLabels = isInverted ? ADOPTION_LABELS : NORMAL_LABELS;

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 0.75 }}>
        <Typography variant="body2" fontWeight={600} color="text.primary">
          {label}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {description}
        </Typography>
      </Box>
      <ToggleButtonGroup
        value={value ?? null}
        exclusive
        onChange={(_, v) => { if (v !== null) onChange(v as number); }}
        size="small"
        fullWidth
        sx={{ gap: 0.5 }}
      >
        {OPTIONS.map((opt) => (
          <Tooltip key={opt} title={tooltipLabels[opt]} placement="top" arrow>
            <ToggleButton
              value={opt}
              sx={{
                flex: 1,
                fontWeight: 700,
                fontSize: "0.875rem",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "8px !important",
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "white",
                  borderColor: "primary.main",
                  "&:hover": { bgcolor: "primary.dark" },
                },
              }}
            >
              {opt}
            </ToggleButton>
          </Tooltip>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
}
