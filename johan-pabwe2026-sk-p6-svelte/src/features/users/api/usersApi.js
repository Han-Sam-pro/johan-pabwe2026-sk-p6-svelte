import { apiFetch } from "../../../helpers/apiHelper.js";

export async function getMe() {
  const json = await apiFetch("/users/me");
  return json.data.user;
}

export async function getUsers() {
  const json = await apiFetch("/users");
  return json.data.users;
}

export async function updateMe({ name, email }) {
  return apiFetch("/users/me", {
    method: "PUT",
    body: { name, email },
  });
}

export async function updatePassword({ password, newPassword, newPasswordConfirm }) {
  return apiFetch("/users/me/password", {
    method: "PUT",
    body: {
      password,
      new_password: newPassword,
      new_password_confirm: newPasswordConfirm,
    },
  });
}

export async function updatePhoto(file) {
  const formData = new FormData();
  formData.append("photo", file);

  return apiFetch("/users/me/photo", {
    method: "POST",
    formData,
  });
}
