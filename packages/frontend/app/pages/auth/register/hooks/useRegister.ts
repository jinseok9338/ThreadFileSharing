import { useMutation } from "@tanstack/react-query";
import { registerAPI } from "../services/api";

const useRegister = () => {
  return useMutation({
    mutationFn: registerAPI,
  });
};

export default useRegister;


