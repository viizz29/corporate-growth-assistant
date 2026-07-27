import { http, HttpResponse } from "msw";

// 🔐 LOGIN
const login = http.post("/api/v1/auth/login", async () => {
  return HttpResponse.json({
    token:
      "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyIiwiaWF0IjoxNzc1MjI4OTI2LCJleHAiOjE3ODM4Njg5MjZ9.GzGzr2_vf3zgVqt_irz7wE8wqxXSAWDKyrTqd2K8sgo",
    user: {
      id: 2,
      username: "user",
      role: "USER",
    },
  });
});

export const handlers = [login];
