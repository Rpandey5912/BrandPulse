import { useState, type FormEvent, type ChangeEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  BarChart3,
  ArrowLeft,
  CreditCard,
  Check,
  Lock,
  ShieldCheck,
} from "lucide-react";

type PlanKey = "trial" | "silver" | "gold" | "platinum";
type PaymentMethodKey = "credit_card" | "debit_card" | "paypal";

const urlParams = new URLSearchParams(window.location.search);
const planParam = (urlParams.get("plan") || "silver") as PlanKey;
const clientIdParam = urlParams.get("client_id") || "";

interface PlanDetails {
  name: string;
  price: number;
  period: string;
}

const planDetails: Record<PlanKey, PlanDetails> = {
  trial: { name: "Trial", price: 0, period: "3 months free" },
  silver: { name: "Silver", price: 99, period: "/month" },
  gold: { name: "Gold", price: 249, period: "/month" },
  platinum: { name: "Platinum", price: 499, period: "/month" },
};

interface PaymentMethod {
  key: PaymentMethodKey;
  label: string;
  icon: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  { key: "credit_card", label: "Credit Card", icon: "💳" },
  { key: "debit_card", label: "Debit Card", icon: "🏦" },
  { key: "paypal", label: "PayPal", icon: "🅿️" },
];

interface CardForm {
  name: string;
  number: string;
  expiry: string;
  cvv: string;
}

// Mock client data for demo
const MOCK_CLIENTS = [
  { id: "1", name: "TechCorp Solutions", email: "admin@techcorp.com" },
  { id: "2", name: "Marketing Pro", email: "contact@marketingpro.com" },
  { id: "3", name: "BrandFlow Inc", email: "hello@brandflow.com" },
  { id: "4", name: "SocialBoost", email: "support@socialboost.com" },
  { id: "5", name: "Digital Nexus", email: "info@digitalnexus.com" },
];

// Store subscriptions in memory (simulating database)
let mockSubscriptions: any[] = [];

export default function Payment() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const plan = planDetails[planParam] || planDetails.silver;

  const [step, setStep] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodKey | "">("");
  const [loading, setLoading] = useState<boolean>(false);

  const [cardForm, setCardForm] = useState<CardForm>({
    name: "",
    number: "",
    expiry: "",
    cvv: "",
  });
  const [paypalEmail, setPaypalEmail] = useState<string>("");

  const formatCardNumber = (val: string): string => {
    return val
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();
  };

  const formatExpiry = (val: string): string => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  };

  const handleMethodSelect = (method: PaymentMethodKey): void => {
    setPaymentMethod(method);
    setStep(2);
  };

  const handlePaymentSubmit = async (
    e: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 1800));

    // Check if client exists in our mock data
    const clientExists = MOCK_CLIENTS.some(
      (client) => client.id === clientIdParam,
    );

    if (clientIdParam && clientExists) {
      // Simulate updating client status
      console.log(`Client ${clientIdParam} subscription activated`);

      // Create subscription record in memory
      const now = new Date().toISOString();
      const end = new Date();
      end.setMonth(end.getMonth() + 1);

      const newSubscription = {
        id: Math.random().toString(36).substr(2, 9),
        client_id: clientIdParam,
        plan: planParam,
        amount: plan.price,
        status: "active",
        billing_cycle: "monthly",
        start_date: now,
        end_date: end.toISOString(),
        payment_method: paymentMethod,
        payment_status: "paid",
        created_at: now,
      };

      mockSubscriptions.push(newSubscription);
      console.log("Subscription created:", newSubscription);
    } else if (clientIdParam && !clientExists) {
      console.warn(`Client ${clientIdParam} not found in mock data`);
    }

    setLoading(false);
    setStep(3);

    // Show success toast
    toast({
      title: "Payment Successful!",
      description: `Your ${plan.name} plan is now active.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 mb-10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading font-extrabold text-xl">
            BrandPulse
          </span>
        </Link>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step > s
                    ? "bg-emerald-500 text-white"
                    : step === s
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              <span
                className={`text-xs ${
                  step === s
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                }`}
              >
                {s === 1 ? "Payment Method" : s === 2 ? "Details" : "Complete"}
              </span>
              {s < 3 && (
                <div
                  className={`flex-1 h-0.5 w-12 ${
                    step > s ? "bg-emerald-500" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          {/* Main Panel */}
          <div className="md:col-span-3">
            {/* Step 1: Choose Method */}
            {step === 1 && (
              <div className="bg-card rounded-2xl border p-6 space-y-4">
                <h2 className="font-heading text-xl font-extrabold">
                  Select Payment Method
                </h2>
                <p className="text-sm text-muted-foreground">
                  Choose how you'd like to pay for your BrandPulse subscription.
                </p>
                <div className="space-y-3 mt-4">
                  {PAYMENT_METHODS.map((m) => (
                    <button
                      key={m.key}
                      onClick={() => handleMethodSelect(m.key)}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-muted hover:border-primary hover:bg-primary/5 transition-all text-left group"
                    >
                      <span className="text-2xl">{m.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium">{m.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {m.key === "paypal"
                            ? "Pay securely with your PayPal account"
                            : "Secure card payment with 256-bit encryption"}
                        </p>
                      </div>
                      <div className="w-5 h-5 rounded-full border-2 border-muted group-hover:border-primary flex items-center justify-center" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Payment Details */}
            {step === 2 && (
              <div className="bg-card rounded-2xl border p-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <h2 className="font-heading text-xl font-extrabold mb-1">
                  {paymentMethod === "paypal"
                    ? "Connect PayPal"
                    : paymentMethod === "credit_card"
                      ? "Credit Card"
                      : "Debit Card"}
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Enter your payment details to complete your subscription.
                </p>

                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  {paymentMethod === "paypal" ? (
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
                        <span className="text-2xl">🅿️</span>
                        <div>
                          <p className="text-sm font-medium text-blue-800">
                            Pay with PayPal
                          </p>
                          <p className="text-xs text-blue-600">
                            You'll be redirected to PayPal to authorize the
                            payment.
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>PayPal Email</Label>
                        <Input
                          required
                          type="email"
                          value={paypalEmail}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setPaypalEmail(e.target.value)
                          }
                          placeholder="your@paypal.com"
                          className="rounded-xl h-11"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Cardholder Name</Label>
                        <Input
                          required
                          value={cardForm.name}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setCardForm((p) => ({ ...p, name: e.target.value }))
                          }
                          placeholder="John Doe"
                          className="rounded-xl h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Card Number</Label>
                        <div className="relative">
                          <Input
                            required
                            value={cardForm.number}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              setCardForm((p) => ({
                                ...p,
                                number: formatCardNumber(e.target.value),
                              }))
                            }
                            placeholder="1234 5678 9012 3456"
                            className="rounded-xl h-11 pr-12"
                            maxLength={19}
                          />
                          <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Expiry Date</Label>
                          <Input
                            required
                            value={cardForm.expiry}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              setCardForm((p) => ({
                                ...p,
                                expiry: formatExpiry(e.target.value),
                              }))
                            }
                            placeholder="MM/YY"
                            className="rounded-xl h-11"
                            maxLength={5}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>CVV</Label>
                          <Input
                            required
                            type="password"
                            value={cardForm.cvv}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              setCardForm((p) => ({
                                ...p,
                                cvv: e.target.value
                                  .replace(/\D/g, "")
                                  .slice(0, 4),
                              }))
                            }
                            placeholder="•••"
                            className="rounded-xl h-11"
                            maxLength={4}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      Your payment is encrypted and secure. We never store your
                      card details.
                    </span>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-xl text-base bg-gradient-to-r from-primary to-accent hover:opacity-90 mt-2"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      <>
                        Pay ${plan.price}/mo — Start {plan.name} Plan
                      </>
                    )}
                  </Button>
                </form>
              </div>
            )}

            {/* Step 3: Success */}
            {step === 3 && (
              <div className="bg-card rounded-2xl border p-8 text-center space-y-5">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
                  <Check className="w-10 h-10 text-emerald-500" />
                </div>
                <div>
                  <h2 className="font-heading text-2xl font-extrabold mb-2">
                    Payment Successful!
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Your <strong>{plan.name}</strong> subscription is now
                    active. Welcome to BrandPulse!
                  </p>
                </div>
                <div className="bg-muted/50 rounded-xl p-4 text-sm text-left space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan</span>
                    <span className="font-medium capitalize">{plan.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-medium">${plan.price}/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Payment Method
                    </span>
                    <span className="font-medium capitalize">
                      {paymentMethod.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium text-emerald-600">✓ Paid</span>
                  </div>
                </div>
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  Go to My Dashboard →
                </Button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          {step < 3 && (
            <div className="md:col-span-2">
              <div className="bg-card rounded-2xl border p-5 sticky top-6">
                <h3 className="font-heading font-bold text-sm mb-4">
                  Order Summary
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {plan.name} Plan
                    </span>
                    <span className="font-medium">${plan.price}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Billing</span>
                    <span>Monthly</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-bold">
                    <span>Total Today</span>
                    <span>${plan.price}</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Cancel anytime. No hidden fees.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
