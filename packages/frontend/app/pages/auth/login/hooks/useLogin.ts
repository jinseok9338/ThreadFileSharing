import { useMutation } from "@tanstack/react-query";
import { loginAPI } from "../services/api";

const useLogin = () => {
  return useMutation({
    mutationFn: loginAPI,
  });
};

export default useLogin;
