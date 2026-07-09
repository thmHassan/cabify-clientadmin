import ApiService from "./ApiService";

export async function apiSignIn(data) {
  return ApiService.fetchData({
    url: "/sign-in",
    method: "post",
    data,
  });
}

export async function apiAdminSignIn(data) {
  // Create FormData for the admin login API
  const formData = new FormData();
  formData.append('email', data.email);
  formData.append('password', data.password);
  // formData.append('role', data.role || 'superadmin');

  return ApiService.fetchData({
    url: "/company/login",
    method: "post",
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

export async function apiSignOut() {
  return ApiService.fetchData({
    url: "/sign-out",
    method: "post",
  });
}

export async function apiForgotPassword(data) {
  const payload = {
    email: data.email,
  };

  const primaryUrl = "/company/forgot-password";
  const fallbackUrl = "/forgot-password";
  try {
    return await ApiService.fetchData({
      url: primaryUrl,
      method: "post",
      data: payload,
    });
  } catch (primaryError) {
    if (primaryError?.response?.status === 404 || primaryError?.response?.status === 405) {
      return await ApiService.fetchData({
        url: fallbackUrl,
        method: "post",
        data: payload,
      });
    }
    throw primaryError;
  }

}

export async function apiResetPassword(data) {
  const payload = data;
  const primaryUrl = "/company/reset-password";
  const fallbackUrl = "/reset-password";

  try {
    return await ApiService.fetchData({
      url: primaryUrl,
      method: "post",
      data: payload,
    });
  } catch (primaryError) {
    if (primaryError?.response?.status === 404 || primaryError?.response?.status === 405) {
      return await ApiService.fetchData({
        url: fallbackUrl,
        method: "post",
        data: payload,
      });
    }
    throw primaryError;
  }
}
