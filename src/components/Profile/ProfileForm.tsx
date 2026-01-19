"use client";

import { useReducer } from "react";
import { useProfileStore } from "../../stores/profileStore";
import { updateProfileData } from "../../services/profileService";
import { useAuthStore } from "../../stores/authStore";
import { TextField, MenuItem } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useAlertStore } from "../../stores/alertStore";
import { useLoadingStore } from "../../stores/loadingStore";
import CircularProgress from "@mui/material/CircularProgress";
import dayjs, { type Dayjs } from "dayjs";

const ProfileForm: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const { isEditing, setIsEditing } = useProfileStore();
  const showAlert = useAlertStore((state) => state.showAlert);
  const { isLoading, setLoading } = useLoadingStore();

  const positions = [
    "Goalkeeper",
    "Defender",
    "Midfielder",
    "Forward",
    "CAM",
    "CDM",
    "GK",
    "CB",
    "RB",
    "RWB",
    "LB",
    "LWB",
    "CM",
    "ST",
    "LW",
    "RW",
  ];

  const initialDateOfBirth: Dayjs | null =
    (user?.date_of_birth && dayjs(user.date_of_birth)) ||
    (user?.user_metadata?.date_of_birth &&
      dayjs(user.user_metadata.date_of_birth)) ||
    null;

  const initialState = {
    formData: {
      full_name: user?.full_name || "",
      email: user?.email || "",
      dateOfBirth: initialDateOfBirth,
      date_of_birth: initialDateOfBirth ? initialDateOfBirth.valueOf() : 0,
      favorite_soccer_player: user?.favorite_soccer_player || "",
      position: user?.position || "",
    },
    errors: {
      full_name: "",
      email: "",
      dateOfBirth: "",
      favorite_soccer_player: "",
      position: "",
    },
  };

  type Action =
    | {
        type: "SET_FIELD";
        field: keyof typeof initialState.formData;
        value: string | number | Dayjs | null;
      }
    | { type: "SET_DATE"; value: Dayjs }
    | { type: "SET_ERRORS"; errors: typeof initialState.errors }
    | { type: "RESET"; payload?: typeof initialState };

  const reducer = (state: typeof initialState, action: Action) => {
    switch (action.type) {
      case "SET_FIELD":
        return {
          ...state,
          formData: {
            ...state.formData,
            [action.field]: action.value,
          },
          errors: {
            ...state.errors,
            [action.field]: "",
          },
        };
      case "SET_DATE":
        return {
          ...state,
          formData: {
            ...state.formData,
            dateOfBirth: action.value,
            date_of_birth: action.value.valueOf(),
          },
          errors: {
            ...state.errors,
            dateOfBirth: "",
          },
        };
      case "SET_ERRORS":
        return { ...state, errors: action.errors };
      case "RESET":
        // return action.payload || initialState;
        return initialState;
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    dispatch({
      type: "SET_FIELD",
      field: name as keyof typeof initialState.formData,
      value,
    });
  };

  const handleDateChange = (date: Dayjs | null) => {
    if (date) {
      dispatch({ type: "SET_DATE", value: date });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors = {
      full_name: state.formData.full_name.trim()
        ? ""
        : "Name is required.",
      email: state.formData.email.trim() ? "" : "Email is required.",
      dateOfBirth:
        state.formData.dateOfBirth && dayjs(state.formData.dateOfBirth).isValid()
          ? ""
          : "Valid date of birth is required.",
      favorite_soccer_player: "",
      position: state.formData.position.trim()
        ? ""
        : "Position is required.",
    };

    dispatch({ type: "SET_ERRORS", errors: nextErrors });

    const hasErrors = Object.values(nextErrors).some((error) => error);
    if (hasErrors) return;

    setLoading(true);
    try {
      const updated = await updateProfileData(user.id, state.formData);
      console.log("Updated Profile Data:", updated);
      // updateUserProfile(state.formData);
      setUser({ ...user, ...updated });

      setIsEditing(false);
      setLoading(false);
      showAlert("success", "Profile successfully updated!");
      dispatch({ type: "RESET" });
    } catch (error) {
      showAlert("error", (error as Error).message);
    } finally {
      setLoading(false);
    }
    // console.log("User:", user);
  };

  if (!isEditing) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto w-full">
      <div className="surface-card p-6 md:p-8 rounded-3xl shadow-xl border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary-900 dark:text-primary-200 font-semibold">
              Editing mode
            </p>
            <h2 className="section-title text-left">Refresh your profile</h2>
            <p className="muted-copy">
              Update your details so teammates know who is on the pitch. Saving
              will instantly refresh your avatar card above.
            </p>
          </div>
          {isLoading && <CircularProgress size={26} />}
        </div>

        {!isLoading ? (
          <form
            onSubmit={handleSubmit}
            className="font-special mt-6 grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <TextField
              label="Name"
              name="full_name"
              value={state.formData.full_name}
              onChange={handleInputChange}
              fullWidth
              error={!!state.errors.full_name}
              helperText={state.errors.full_name}
            />

            <TextField
              label="Email"
              name="email"
              value={state.formData.email}
              onChange={handleInputChange}
              fullWidth
              disabled
            />

            <DatePicker
              label="Date of Birth"
              value={state.formData.dateOfBirth}
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!state.errors.dateOfBirth,
                  helperText: state.errors.dateOfBirth,
                },
                layout: {
                  sx: {
                    color: "var(--color-neutral-50)",
                    borderRadius: "8px",
                    borderWidth: "1px",
                    borderColor: "var(--color-primary-700)",
                    border: "1px solid",
                    backgroundColor: "var(--color-neutral-800)",
                  },
                },
              }}
              disableFuture
            />

            <TextField
              label="Favorite Soccer Player"
              name="favorite_soccer_player"
              value={state.formData.favorite_soccer_player}
              onChange={handleInputChange}
              fullWidth
            />

            <TextField
              select
              label="Position"
              name="position"
              value={state.formData.position}
              onChange={handleInputChange}
              fullWidth
              error={!!state.errors.position}
              helperText={state.errors.position}
            >
              {positions.map((pos) => (
                <MenuItem key={pos} value={pos}>
                  {pos}
                </MenuItem>
              ))}
            </TextField>

            <div className="flex items-center justify-end gap-3 md:col-span-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  dispatch({ type: "RESET" });
                }}
                className="bg-fail-800 text-white px-4 py-2 rounded hover:bg-fail-900 transition-colors"
              >
                Cancel
              </button>
              <button type="submit" className="button">
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="flex justify-center items-center py-12">
            <CircularProgress />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileForm;
