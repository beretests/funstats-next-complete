"use client";

import React, { useEffect, useMemo, useState } from "react";
// import { useLoadingStore } from "../stores/loadingStore";
import { useSearchParams } from "next/navigation";
import { useForm, Controller, useFieldArray, useWatch } from "react-hook-form";
import {
  TextField,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  IconButton,
  Autocomplete,
  Stack,
  Checkbox,
  FormControlLabel,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

type Award = {
  award_id: string;
  award_name: string;
};

// type AwardOption = {
//   id: string;
//   name: string;
// };

type FormValues = {
  game_id: string;
  date: dayjs.Dayjs;
  home_team_name: string;
  away_team_name: string;
  player_team_name: string;
  stat_id: string;
  stat_value: number;
  awards: Award[];
};

type SelectedStat = {
  game_id: string;
  date: string;
  home_team_name: string;
  away_team_name: string;
  player_team_name?: string;
  stat_id?: string;
  stat_value: number;
  awards?: Award[];
};

type TeamOption = {
  label: string;
  value: string;
};

async function fetchTeams(): Promise<TeamOption[]> {
  // simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { label: "Titans", value: "Titans" },
        { label: "Whitecaps", value: "Whitecaps" },
        { label: "Warriors", value: "Warriors" },
        { label: "Sharks", value: "Sharks" },
      ]);
    }, 500);
  });
}

async function fetchAwards(): Promise<Award[]> {
  // simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { award_id: "Titans", award_name: "Titans" },
        { award_id: "Whitecaps", award_name: "Whitecaps" },
        { award_id: "Warriors", award_name: "Warriors" },
        { award_id: "Sharks", award_name: "Sharks" },
        {
          award_id: "79bfe9a3-b907-4e64-a1c6-a62d66187948",
          award_name: "Player of the Match",
        },
      ]);
    }, 500);
  });
}

const EditGameStatPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const searchParams = useSearchParams();
  const selectedStatParam = searchParams?.get("selectedStat");
  const label = searchParams?.get("label") || "";
  const selectedStat = useMemo<SelectedStat | null>(() => {
    if (!selectedStatParam) return null;
    try {
      return JSON.parse(decodeURIComponent(selectedStatParam)) as SelectedStat;
    } catch {
      return null;
    }
  }, [selectedStatParam]);

  const defaultData: FormValues = useMemo(
    () => ({
      game_id: selectedStat?.game_id ?? "",
      date: selectedStat?.date ? dayjs(selectedStat.date) : dayjs(),
      home_team_name: selectedStat?.home_team_name ?? "",
      away_team_name: selectedStat?.away_team_name ?? "",
      player_team_name: selectedStat?.player_team_name ?? "",
      stat_id: selectedStat?.stat_id ?? "",
      stat_value: selectedStat?.stat_value ?? 0,
      awards: selectedStat?.awards ?? [],
    }),
    [selectedStat]
  );

  const [teamOptions, setTeamOptions] = useState<TeamOption[]>([]);
  const [availableAwards, setAvailableAwards] = useState<Award[]>([]);

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const teams = await fetchTeams();
        setTeamOptions(teams);
      } finally {
        //   setLoading(false);
      }
    };

    const loadAwards = async () => {
      try {
        const awards = await fetchAwards();
        setAvailableAwards(awards);
      } finally {
        //   setLoading(false);
      }
    };

    loadTeams();
    loadAwards();
  }, []);

  const { control, handleSubmit, setValue } = useForm<FormValues>({
    defaultValues: defaultData,
    mode: "onBlur",
  });

  const homeTeam = useWatch({ control, name: "home_team_name" });
  const awayTeam = useWatch({ control, name: "away_team_name" });
  const playerTeam = useWatch({ control, name: "player_team_name" });

  const { fields, append, remove } = useFieldArray<FormValues, "awards">({
    control,
    name: "awards",
  });

  const filterOptions = (type: "home" | "away") => {
    return teamOptions.filter((opt) => {
      if (type === "home") return opt.value !== awayTeam;
      if (type === "away") return opt.value !== homeTeam;
      return true;
    });
  };

  const isCheckboxDisabled = !homeTeam && !awayTeam;

  const onSubmit = (data: FormValues) => {
    console.log("Updated Data:", {
      ...data,
      date: data.date.format("YYYY-MM-DD"),
    });
    // TODO: Send to API/backend
  };

  if (!selectedStat) {
    return <div>Error: No stat data provided.</div>;
  }

  return (
    <div className="page-shell space-y-4">
      <Button
        className="!normal-case !font-nunito !text-primary-900 dark:!text-primary-200"
        startIcon={<ArrowBackIosIcon />}
        onClick={() => window.history.back()}
      >
        Back to Stats Page
      </Button>
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          maxWidth: 500,
          mx: "auto",
        }}
        >
          <Typography
            variant="h5"
            textAlign="center"
            className="!font-special !text-primary-900 dark:!text-primary-200"
          >
            Update {label} Stat
          </Typography>

        <Controller
          name="date"
          control={control}
          rules={{
            required: "Date is required",
          }}
          render={({ field, fieldState }) => (
            <DatePicker
              {...field}
              label="Game Date"
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!fieldState.error,
                  helperText: fieldState.error?.message,
                },
              }}
            />
          )}
        />

        <Controller
          name="home_team_name"
          control={control}
          rules={{ required: "Home team is required" }}
          render={({ field, fieldState }) => (
            <div className="flex gap-2 justify-end">
              <Autocomplete<TeamOption>
                options={filterOptions("home")}
                // loading={loading}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) =>
                  option.value === (value as TeamOption)?.value
                }
                onChange={(_, value) => {
                  const selected = value?.value || "";
                  field.onChange(selected);
                  if (selected && selected === awayTeam) {
                    setValue("away_team_name", "");
                  }
                  if (selected !== playerTeam && playerTeam === homeTeam) {
                    setValue("player_team_name", "");
                  }
                }}
                value={
                  teamOptions.find((opt) => opt.value === field.value) || null
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Home Team"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
                sx={{ flexGrow: 1 }}
              />
              {homeTeam &&
                (isMobile ? (
                  <Tooltip title="Mark as My Team">
                    <Checkbox
                      checked={playerTeam === homeTeam}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setValue("player_team_name", homeTeam);
                        } else if (playerTeam === homeTeam) {
                          setValue("player_team_name", "");
                        }
                      }}
                      disabled={isCheckboxDisabled}
                    />
                  </Tooltip>
                ) : (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={playerTeam === homeTeam}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setValue("player_team_name", homeTeam);
                          } else if (playerTeam === homeTeam) {
                            setValue("player_team_name", "");
                          }
                        }}
                        disabled={isCheckboxDisabled}
                      />
                    }
                    label="Mark as My Team"
                    sx={{ marginRight: 0 }}
                    className="text-ok-800 dark:text-ok-200"
                  />
                ))}
            </div>
          )}
        />

        <Controller
          name="away_team_name"
          control={control}
          rules={{ required: "Away team is required" }}
          render={({ field, fieldState }) => (
            <div className="flex gap-2">
              <Autocomplete<TeamOption>
                options={filterOptions("away")}
                // loading={loading}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) =>
                  option.value === (value as TeamOption)?.value
                }
                onChange={(_, value) => {
                  const selected = value?.value || "";
                  field.onChange(selected);
                  if (selected && selected === homeTeam) {
                    setValue("home_team_name", "");
                  }
                  if (selected !== playerTeam && playerTeam === awayTeam) {
                    setValue("player_team_name", "");
                  }
                }}
                value={
                  teamOptions.find((opt) => opt.value === field.value) || null
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Away Team"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
                sx={{ flexGrow: 1 }}
              />
              {awayTeam &&
                (isMobile ? (
                  <Tooltip title="Mark as My Team">
                    <Checkbox
                      checked={playerTeam === awayTeam}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setValue("player_team_name", awayTeam);
                        } else if (playerTeam === awayTeam) {
                          setValue("player_team_name", "");
                        }
                      }}
                      disabled={isCheckboxDisabled}
                    />
                  </Tooltip>
                ) : (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={playerTeam === awayTeam}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setValue("player_team_name", awayTeam);
                          } else if (playerTeam === awayTeam) {
                            setValue("player_team_name", "");
                          }
                        }}
                        disabled={isCheckboxDisabled}
                      />
                    }
                    label="Mark as My Team"
                    sx={{ marginRight: 0 }}
                    className="text-ok-800 dark:text-ok-200"
                  />
                ))}
            </div>
          )}
        />

        <Controller
          name="stat_value"
          control={control}
          rules={{
            required: "Stat Value is required",
            min: { value: 0, message: "Must be >= 0" },
          }}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              type="number"
              label="Stat Value"
              fullWidth
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />

        <Card variant="outlined" sx={{ mt: 2 }}>
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h6">Awards</Typography>
              <IconButton
                onClick={() => append({ award_id: "", award_name: "" })}
              >
                <Add />
              </IconButton>
            </Stack>

            {fields.map((field, index) => (
              <Box
                key={field.id}
                sx={{
                  display: "flex",
                  gap: 1,
                  alignItems: "center",
                  mb: 2,
                  justifyContent: "space-between",
                }}
              >
                <Controller
                  name={`awards.${index}` as const}
                  control={control}
                  rules={{ required: "Award Name is required" }}
                  render={({ field, fieldState }) => (
                    <Autocomplete<Award>
                      {...field}
                      options={availableAwards}
                      getOptionLabel={(option) => option.award_name || ""}
                      isOptionEqualToValue={(option, value) =>
                        option.award_id === value?.award_id
                      }
                      //   loading={loading}
                      value={field.value || null}
                      onChange={(_, value) => field.onChange(value)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={`Award ${index + 1} Name`}
                          fullWidth
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                        />
                      )}
                      sx={{ flexGrow: 1 }}
                    />
                  )}
                />
                <IconButton color="error" onClick={() => remove(index)}>
                  <Delete />
                </IconButton>
              </Box>
            ))}

            {fields.length === 0 && (
              <Typography className="!text-neutral-800 dark:!text-neutral-300">
                No awards yet. Click + to add one.
              </Typography>
            )}
          </CardContent>
        </Card>

        <Controller
          name="player_team_name"
          control={control}
          rules={{ required: "You must mark one team as My Team" }}
          render={({ fieldState }) => (
            <>
              {fieldState.error ? (
                <span style={{ color: "red", marginLeft: 8 }}>
                  {fieldState.error.message}
                </span>
              ) : null}
            </>
          )}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          className="!text-white !bg-primary-800 hover:!bg-primary-900 !normal-case !rounded-lg !shadow-lg !px-2 !font-special !transition-colors"
        >
          Update Game
        </Button>
      </Box>
    </div>
  );
};

export default EditGameStatPage;
