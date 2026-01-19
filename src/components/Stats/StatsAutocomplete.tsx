"use client";

import React, { useState } from "react";
import {
  Autocomplete,
  Checkbox,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";

interface Option {
  id: string;
  name: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  club?: Option;
  age_division?: string;
  skill_tier?: string;
}

interface AutocompleteProps {
  label: string;
  options: Option[];
  checkbox: string;
  onChange: (value: Option | null) => void;
  onCheckboxChange?: (checked: boolean) => void;
  isCheckboxDisabled?: boolean;
  isCheckboxChecked?: boolean;
  onAddNew?: (newOption: Option) => void;
  clubs?: Option[];
}

const StatsAutocomplete: React.FC<AutocompleteProps> = ({
  label,
  options,
  checkbox,
  onChange,
  onCheckboxChange,
  isCheckboxDisabled = true,
  isCheckboxChecked = false,
  onAddNew,
  clubs = [],
}) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedClub, setSelectedClub] = useState<Option | null>(null);
  const [ageDivision, setAgeDivision] = useState("");
  const [skillTier, setSkillTier] = useState("");
  const [ageDivisionError, setAgeDivisionError] = useState(false);

  const handleAddNew = () => {
    if (name.trim()) {
      const newEntry: Option = {
        id: crypto.randomUUID(),
        name: name,
        location: location,
        start_date: startDate,
        end_date: endDate,
        age_division: ageDivision,
        skill_tier: skillTier,
      };
      if (label === "Select Club") {
        newEntry["location"] = location;
      } else if (label === "Select Season" || label === "Select Tournament") {
        newEntry["start_date"] = startDate;
        newEntry["end_date"] = endDate;
      } else if (label === "Select Home Team" || label === "Select Away Team") {
        if (selectedClub) {
          newEntry["club"] = selectedClub;
        }
        newEntry["age_division"] = ageDivision;
        newEntry["skill_tier"] = skillTier;
      }
      onAddNew?.(newEntry);
      setName("");
      setLocation("");
      setStartDate("");
      setEndDate("");
      setAgeDivision("");
      setAgeDivisionError(false);
      setSkillTier("");
      setSelectedClub(null);
      setOpen(false);
    }
  };

  return (
    <div className="flex justify-evenly">
      <Autocomplete
        options={[{ id: "new", name: "Add New" }, ...options]}
        getOptionLabel={(option) => option.name}
        renderInput={(params) => (
          <TextField {...params} label={label} variant="outlined" />
        )}
        onChange={(_event, newValue) => {
          if (newValue?.id === "new") {
            setOpen(true);
          } else {
            onChange(newValue);
          }
        }}
        fullWidth
        sx={{
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "rgb(209, 213, 219)", // Tailwind's gray-300
            },
            "&:hover fieldset": {
              borderColor: "rgb(156, 163, 175)", // Tailwind's gray-500
            },
            "&.Mui-focused fieldset": {
              borderColor: "rgb(59, 130, 246)",
            },
          },
        }}
      />
      {(checkbox === "homeTeamId" || checkbox === "awayTeamId") && (
        <Checkbox
          id={checkbox}
          checked={isCheckboxChecked}
          disabled={isCheckboxDisabled}
          onChange={(_event, checked) => onCheckboxChange?.(checked)}
          color="primary"
          className="justify-self-end !pr-0"
        />
      )}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New {label.replace("Select ", "")}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            required
            margin="dense"
            label="Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {label === "Select Club" && (
            <TextField
              required
              margin="dense"
              label="Location"
              fullWidth
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          )}
          {(label === "Select Home Team" || label === "Select Away Team") && (
            <>
              <Autocomplete
                options={clubs}
                getOptionLabel={(option) => option.name}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Club"
                    variant="outlined"
                  />
                )}
                value={selectedClub}
                onChange={(_event, newValue) => setSelectedClub(newValue)}
                fullWidth
                sx={{
                  marginBottom: "1rem",
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "rgb(209, 213, 219)" },
                    "&:hover fieldset": { borderColor: "rgb(156, 163, 175)" },
                    "&.Mui-focused fieldset": {
                      borderColor: "rgb(59, 130, 246)",
                    },
                  },
                }}
              />
              <TextField
                required
                margin="dense"
                label="Age Division"
                fullWidth
                value={ageDivision}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  setAgeDivision(value);
                  setAgeDivisionError(!/^U\d{0,2}[BG]?$/.test(value));
                }}
                onBlur={() => {
                  setAgeDivisionError(!/^U\d{1,2}[BG]$/.test(location));
                }}
                error={ageDivisionError}
                helperText={
                  ageDivisionError ? "Must match format U##B/G or U#B/G" : ""
                }
                slotProps={{
                  htmlInput: {
                    pattern: "^U\\d{1,2}[BG]$",
                    title: "Format: U##B/G or U#B/G",
                  },
                }}
              />
              <TextField
                required
                margin="dense"
                label="Skill Tier"
                fullWidth
                value={skillTier}
                onChange={(e) => setSkillTier(e.target.value)}
                placeholder="e.g. Div1, Div2"
              />
            </>
          )}
          {(label === "Select Season" || label === "Select Tournament") && (
            <>
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
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
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
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpen(false)}
            className="!text-primary-900 hover:!bg-primary-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddNew}
            variant="contained"
            className="!bg-primary-800 !text-white hover:!bg-primary-900"
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default StatsAutocomplete;
