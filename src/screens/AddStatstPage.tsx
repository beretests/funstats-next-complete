"use client";

import React, { useEffect, useState } from "react";
import useSeasonStore from "../stores/seasonStore";
import { useAlertStore } from "../stores/alertStore";
import { useLoadingStore } from "../stores/loadingStore";
import { useAuthStore } from "../stores/authStore";
import api from "../services/api";
import StatsAutocomplete from "../components/Stats/StatsAutocomplete";
import Grid from "@mui/material/Grid2";
import { CircularProgress, TextField } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useRouter } from "next/navigation";

interface FormSubmissionPayload {
  date: string | dayjs.Dayjs;
  playerId: string;
  homeTeamId: string;
  seasonId: string;
  awayTeamId: string;
  teamId: string;
  stats: {
    goalsScored: number;
    assists: number;
    shotsOnTarget: number;
    tackles: number;
    interceptions: number;
    saves: number;
    yellowCards: number;
    redCards: number;
    fouls: number;
    headersWon: number;
    offsides: number;
  };
  awardId?: string;
  tournamentId?: string; // Optional if an award is given to the player
}

type FormOption = {
  id: string;
  name: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  club?: FormOption;
  age_division?: string;
  skill_tier?: string;
};

type FormOptionEntry = {
  option: string;
  label: string;
  data: FormOption[];
};

type OptionLabel = {
  option: string;
  label: string;
  submit: string;
  endpoint: string;
};

const OPTION_LABELS: OptionLabel[] = [
  {
    option: "awards",
    label: "Select Award",
    submit: "awardId",
    endpoint: "/api/awards",
  },
  {
    option: "clubs",
    label: "Select Club",
    submit: "clubId",
    endpoint: "/api/clubs",
  },
  {
    option: "away_teams",
    label: "Select Away Team",
    submit: "awayTeamId",
    endpoint: "/api/teams",
  },
  {
    option: "seasons",
    label: "Select Season",
    submit: "seasonId",
    endpoint: "/api/seasons",
  },
  {
    option: "home_teams",
    label: "Select Home Team",
    submit: "homeTeamId",
    endpoint: "/api/teams",
  },
  {
    option: "tournaments",
    label: "Select Tournament",
    submit: "tournamentId",
    endpoint: "/api/tournaments",
  },
];

const initialStats = {
  goalsScored: 0,
  assists: 0,
  shotsOnTarget: 0,
  tackles: 0,
  interceptions: 0,
  saves: 0,
  yellowCards: 0,
  redCards: 0,
  fouls: 0,
  headersWon: 0,
  offsides: 0,
};

const AddStatstPage: React.FC = () => {
  const { user } = useAuthStore();
  const router = useRouter();

  const [formPayload, setFormPayload] = useState<FormSubmissionPayload>({
    date: dayjs(),
    playerId: user?.id ?? "",
    homeTeamId: "",
    seasonId: "",
    awayTeamId: "",
    teamId: "",
    stats: initialStats,
    awardId: undefined,
    tournamentId: undefined,
  });

  const [formOptions, setFormOptions] = useState<FormOptionEntry[]>([]);

  const { selectedSeason } = useSeasonStore();
  const { isLoading, setLoading } = useLoadingStore();
  const showAlert = useAlertStore((state) => state.showAlert);

  const optionLabels = OPTION_LABELS;

  const [homeTeamValue, setHomeTeamValue] = useState<FormOption | null>(null);
  const [awayTeamValue, setAwayTeamValue] = useState<FormOption | null>(null);

  const [isHomeTeamChecked, setIsHomeTeamChecked] = useState(false);
  const [isAwayTeamChecked, setIsAwayTeamChecked] = useState(false);

  useEffect(() => {
    if (user?.id) {
      setFormPayload((prev) => ({
        ...prev,
        playerId: user.id,
      }));
    }
  }, [user?.id]);

  const handleOptionChange = (
    fieldName: keyof FormSubmissionPayload,
    value?: FormOption | null
  ) => {
    setFormPayload((prev) => ({
      ...prev,
      [fieldName]: value?.id || "",
    }));

    if (fieldName === "homeTeamId") setHomeTeamValue(value || null);
    if (fieldName === "awayTeamId") setAwayTeamValue(value || null);
  };

  const handleCheckboxChange = (
    teamType: "home" | "away",
    checked: boolean
  ) => {
    if (teamType === "home") {
      setIsHomeTeamChecked(checked);
      setIsAwayTeamChecked(false);
      setFormPayload((prev) => ({
        ...prev,
        teamId: checked ? prev.homeTeamId : "",
      }));
    } else if (teamType === "away") {
      setIsAwayTeamChecked(checked);
      setIsHomeTeamChecked(false);
      setFormPayload((prev) => ({
        ...prev,
        teamId: checked ? prev.awayTeamId : "",
      }));
    }
  };

  const handleStatChange =
    (field: keyof typeof initialStats) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormPayload((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          [field]: Number(event.target.value),
        },
      }));
    };

  const handleDateChange = (newDate: Dayjs | null) => {
    setFormPayload((prev) => ({
      ...prev,
      date: newDate?.format("YYYY-MM-DD") || dayjs(),
    }));
  };

  const handleSubmit = async (retries = 3) => {
    console.log("Form Submission Payload:", formPayload);
    if (!formPayload.playerId) {
      showAlert("error", "Please sign in to submit stats.");
      return;
    }
    setLoading(true);
    try {
      const submitted = await api.post("/api/stats/add", formPayload);
      console.log("Submitted:", submitted);
      router.push("/stats");
      showAlert("success", `${submitted.data.message}`);
    } catch (error) {
      console.log(error);
      if (retries > 0) {
        console.log(`Retrying... Attempts left: ${retries - 1}`);
        return handleSubmit(retries - 1);
      } else {
        showAlert("error", `${(error as Error).message} Please try again.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = async (
    optionType: string,
    newOptionData: {
      name: string;
      location?: string;
      start_date?: string;
      end_date?: string;
      club?: FormOption;
      age_division?: string;
      skill_tier?: string;
    }
  ) => {
    const optionLabel = optionLabels.find((item) => item.submit === optionType);
    if (!optionLabel) return;

    console.log("Adding new option:", newOptionData);
    try {
      setLoading(true);

      const payload: Record<string, string> = { name: newOptionData.name };
      if (newOptionData.location) payload.location = newOptionData.location;
      if (newOptionData.start_date)
        payload.start_date = newOptionData.start_date;
      if (newOptionData.end_date) payload.end_date = newOptionData.end_date;
      if (newOptionData.club) payload.club_id = newOptionData.club.id;
      if (newOptionData.age_division)
        payload.age_division = newOptionData.age_division;
      if (newOptionData.skill_tier)
        payload.skill_tier = newOptionData.skill_tier;

      const response = await api.post(optionLabel.endpoint, payload);
      const newOption: FormOption = response.data;

      setFormOptions((prev) =>
        prev.map((item) =>
          item.option === optionLabel.submit
            ? { ...item, data: [...item.data, newOption] }
            : item
        )
      );

      showAlert(
        "success",
        `New ${optionLabel.option.replace(/s$/, "")} added successfully!`
      );
    } catch (error) {
      console.error("Failed to add new option:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchFormOptions = async (userId: string, seasonId: string) => {
      setLoading(true);
      try {
        const response = await api.get(`/api/stats/add/options`, {
          params: {
            userId,
            seasonId,
          },
        });

        const options = Object.keys(response.data).map((key) => ({
          option: optionLabels.find((o) => o.option === key)?.submit || key,
          label: optionLabels.find((o) => o.option === key)?.label || key,
          data: response.data[key] as FormOption[],
        }));
        console.log(options);
        setFormOptions(options);
        setLoading(false);
      } catch (error) {
        console.log(error);
        showAlert("error", `${(error as Error).message} Please try again.`);
      } finally {
        setLoading(false);
      }
    };
    if (selectedSeason && user?.id) {
      fetchFormOptions(user.id, selectedSeason.id);
    }
  }, [optionLabels, selectedSeason, setLoading, showAlert, user?.id]);

  return (
    <div className="page-shell space-y-4">
      <h1 className="section-title">Add new game stats</h1>
      {isLoading ? (
        <div className="flex justify-center items-center h-[70vh]">
          <CircularProgress />
        </div>
      ) : (
        <>
          <div className="surface-card p-4">
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 4, sm: 6, lg: 3 }}>
                <DatePicker
                  label="Game Date"
                  value={dayjs(formPayload.date)}
                  onChange={handleDateChange}
                  slotProps={{
                    textField: { fullWidth: true },
                    layout: {
                      sx: {
                        color: "var(--color-neutral-900)",
                        backgroundColor: "var(--color-neutral-100)",
                        borderRadius: "8px",
                        px: 1,
                      },
                    },
                  }}
                  disableFuture
                />
              </Grid>
              {formOptions.map((item, index) => (
                <Grid key={index} size={{ xs: 12, md: 4, sm: 6, lg: 3 }}>
                  <StatsAutocomplete
                    label={item.label}
                    options={item.data}
                    checkbox={item.option}
                    onChange={(value) =>
                      handleOptionChange(
                        item.option as keyof FormSubmissionPayload,
                        value
                      )
                    }
                    onCheckboxChange={(checked) =>
                      handleCheckboxChange(
                        item.option === "homeTeamId" ? "home" : "away",
                        checked
                      )
                    }
                    isCheckboxDisabled={
                      item.option === "homeTeamId"
                        ? !homeTeamValue
                        : item.option === "awayTeamId"
                        ? !awayTeamValue
                        : true
                    }
                    isCheckboxChecked={
                      item.option === "homeTeamId"
                        ? isHomeTeamChecked
                        : item.option === "awayTeamId"
                        ? isAwayTeamChecked
                        : false
                    }
                    onAddNew={(newOption) =>
                      handleAddNew(item.option, newOption)
                    }
                    clubs={formOptions[1]?.data ?? []}
                  />
                </Grid>
              ))}
            </Grid>
          </div>
          <div className="surface-card p-4 flex flex-col justify-center items-center gap-4">
            <Grid container spacing={2}>
              {Object.keys(initialStats).map((key) => (
                <Grid size={{ xs: 6, md: 3, sm: 4, lg: 2 }} key={key}>
                  <TextField
                    label={key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())}
                    value={formPayload.stats[key as keyof typeof initialStats]}
                    onChange={handleStatChange(
                      key as keyof typeof initialStats
                    )}
                    type="number"
                    fullWidth
                    variant="outlined"
                    slotProps={{
                      htmlInput: {
                        min: 0,
                        onKeyDown: (
                          e: React.KeyboardEvent<HTMLInputElement>
                        ) => {
                          if (e.key === "-" || e.key === "e" || e.key === ".") {
                            e.preventDefault();
                          }
                        },
                      },
                    }}
                  />
                </Grid>
              ))}
            </Grid>
            <button className="button md:w-50" onClick={() => handleSubmit()}>
              Add New Game Stat
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AddStatstPage;
