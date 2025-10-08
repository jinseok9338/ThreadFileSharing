interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 w-full">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
};

export default AuthLayout;
