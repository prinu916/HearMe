import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthPage } from "../components/AuthPage";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

// Mock Firebase auth functions
vi.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
}));

// Mock the Firebase client
vi.mock("../integrations/firebase/client", () => ({
  auth: {},
}));

// Mock the toast hook
vi.mock("../hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe("AuthPage", () => {
  const mockOnBack = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders login form by default", () => {
    render(<AuthPage onBack={mockOnBack} onSuccess={mockOnSuccess} />);

    expect(screen.getByText("Sign In")).toBeInTheDocument();
    expect(screen.getByText("Welcome Back")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });

  it("switches to signup form when signup link is clicked", () => {
    render(<AuthPage onBack={mockOnBack} onSuccess={mockOnSuccess} />);

    const signupLink = screen.getByText("Don't have an account? Sign up");
    fireEvent.click(signupLink);

    expect(screen.getByText("Create Account")).toBeInTheDocument();
    expect(screen.getByText("Get Started")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Account" })).toBeInTheDocument();
  });

  it("calls signInWithEmailAndPassword on login form submission", async () => {
    const mockSignIn = vi.mocked(signInWithEmailAndPassword);
    mockSignIn.mockResolvedValueOnce({} as any);

    render(<AuthPage onBack={mockOnBack} onSuccess={mockOnSuccess} />);

    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    const submitButton = screen.getByRole("button", { name: "Sign In" });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({}, "test@example.com", "password123");
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it("calls createUserWithEmailAndPassword on signup form submission", async () => {
    const mockSignUp = vi.mocked(createUserWithEmailAndPassword);
    mockSignUp.mockResolvedValueOnce({} as any);

    render(<AuthPage onBack={mockOnBack} onSuccess={mockOnSuccess} />);

    // Switch to signup mode
    const signupLink = screen.getByText("Don't have an account? Sign up");
    fireEvent.click(signupLink);

    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    const submitButton = screen.getByRole("button", { name: "Create Account" });

    fireEvent.change(emailInput, { target: { value: "newuser@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({}, "newuser@example.com", "password123");
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it("handles login errors gracefully", async () => {
    const mockSignIn = vi.mocked(signInWithEmailAndPassword);
    const error = new Error("Invalid credentials");
    mockSignIn.mockRejectedValueOnce(error);

    render(<AuthPage onBack={mockOnBack} onSuccess={mockOnSuccess} />);

    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    const submitButton = screen.getByRole("button", { name: "Sign In" });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({}, "test@example.com", "password123");
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  it("handles signup errors gracefully", async () => {
    const mockSignUp = vi.mocked(createUserWithEmailAndPassword);
    const error = new Error("Email already in use");
    mockSignUp.mockRejectedValueOnce(error);

    render(<AuthPage onBack={mockOnBack} onSuccess={mockOnSuccess} />);

    // Switch to signup mode
    const signupLink = screen.getByText("Don't have an account? Sign up");
    fireEvent.click(signupLink);

    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    const submitButton = screen.getByRole("button", { name: "Create Account" });

    fireEvent.change(emailInput, { target: { value: "existing@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({}, "existing@example.com", "password123");
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  it("calls onBack when back button is clicked", () => {
    render(<AuthPage onBack={mockOnBack} onSuccess={mockOnSuccess} />);

    const backButton = screen.getByRole("button", { name: /arrowleft/i });
    fireEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalled();
  });
});
