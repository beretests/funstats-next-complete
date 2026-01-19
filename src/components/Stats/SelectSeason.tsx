"use client";

import React, { useState } from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import useSeasonStore from "../../stores/seasonStore";
import { useLoadingStore } from "../../stores/loadingStore";
import CircularProgress from "@mui/material/CircularProgress";
import { useRouter } from "next/navigation";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import api from "../../services/api";
import { useAlertStore } from "../../stores/alertStore";

const SelectSeason: React.FC = () => {
  const { seasons, selectedSeason, setSelectedSeason, addSeason } =
    useSeasonStore();
  const { isLoading } = useLoadingStore();
  const router = useRouter();
  const showAlert = useAlertStore((state) => state.showAlert);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSeasonName, setNewSeasonName] = useState("");
  const [newSeasonStartDate, setNewSeasonStartDate] = useState("");
  const [newSeasonEndDate, setNewSeasonEndDate] = useState("");
  const [errors, setErrors] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });

  const addSeasonValue = "__add_new_season__";

  const handleChange = (event: SelectChangeEvent) => {
    if (event.target.value === addSeasonValue) {
      setIsModalOpen(true);
      return;
    }
    const season = seasons.find((s) => s.id === event.target.value);
    if (season) setSelectedSeason(season);
  };

  const resetForm = () => {
    setNewSeasonName("");
    setNewSeasonStartDate("");
    setNewSeasonEndDate("");
    setErrors({ name: "", startDate: "", endDate: "" });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const validateForm = () => {
    const nextErrors = {
      name: newSeasonName.trim() ? "" : "Season name is required.",
      startDate: newSeasonStartDate ? "" : "Start date is required.",
      endDate: newSeasonEndDate ? "" : "End date is required.",
    };

    if (
      !nextErrors.startDate &&
      !nextErrors.endDate &&
      newSeasonEndDate < newSeasonStartDate
    ) {
      nextErrors.endDate = "End date must be after start date.";
    }

    setErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  };

  const handleAddSeason = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await api.post("/api/seasons", {
        name: newSeasonName.trim(),
        start_date: newSeasonStartDate,
        end_date: newSeasonEndDate,
      });
      const newSeason = response.data;
      addSeason(newSeason);
      setSelectedSeason(newSeason);
      showAlert("success", "Season added successfully.");
      handleCloseModal();
    } catch (error) {
      showAlert("error", `${(error as Error).message} Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col justify-center gap-4 min-h-[70vh] px-4 md:px-8">
      {isLoading ? (
        <div className="flex justify-center items-center h-[90vh]">
          <CircularProgress />
        </div>
      ) : (
        <>
          <h1 className="section-title">Select a season to view your stats </h1>
          <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
            <InputLabel id="season-list-label">Season</InputLabel>
            <Select
              labelId="season-list-label"
              id="season-list"
              value={selectedSeason ? selectedSeason.id : ""}
              label="Season"
              onChange={handleChange}
            >
              <MenuItem value="">
                <em>Select a season</em>
              </MenuItem>
              <MenuItem value={addSeasonValue}>Add New Season</MenuItem>
              {seasons.map((season) => (
                <MenuItem key={season.id} value={season.id}>
                  {season.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {selectedSeason && (
            <>
              <p className="text-center">
                You have selected the <strong>{selectedSeason.name}</strong>{" "}
                season
              </p>
              <button className="button" onClick={() => router.push("/stats")}>
                View your stats
              </button>
            </>
          )}
          <Dialog open={isModalOpen} onClose={handleCloseModal}>
            <DialogTitle>Add New Season</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                required
                margin="dense"
                label="Season Name"
                fullWidth
                value={newSeasonName}
                onChange={(e) => setNewSeasonName(e.target.value)}
                error={Boolean(errors.name)}
                helperText={errors.name}
              />
              <TextField
                required
                margin="dense"
                label="Start Date"
                type="date"
                fullWidth
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
                value={newSeasonStartDate}
                onChange={(e) => setNewSeasonStartDate(e.target.value)}
                error={Boolean(errors.startDate)}
                helperText={errors.startDate}
              />
              <TextField
                required
                margin="dense"
                label="End Date"
                type="date"
                fullWidth
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
                value={newSeasonEndDate}
                onChange={(e) => setNewSeasonEndDate(e.target.value)}
                error={Boolean(errors.endDate)}
                helperText={errors.endDate}
              />
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleCloseModal}
                className="!text-primary-900 hover:!bg-primary-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddSeason}
                variant="contained"
                disabled={isSubmitting}
                className="!bg-primary-800 !text-white hover:!bg-primary-900"
              >
                Add
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default SelectSeason;
