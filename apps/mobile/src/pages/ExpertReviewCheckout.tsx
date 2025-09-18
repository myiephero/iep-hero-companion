import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { getExpertReviewProduct } from "@/lib/expertReviewPricing";
import { Loader2, CheckCircle, CreditCard } from "lucide-react";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ productInfo, onSuccess }: { productInfo: any, onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/expert-review-success`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full"
        data-testid="button-confirm-payment"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            Pay ${productInfo.amount} - Submit for Expert Review
          </>
        )}
      </Button>
    </form>
  );
};

export default function ExpertReviewCheckout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState("");
  const [productInfo, setProductInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get parameters from URL
  const productId = searchParams.get('product');
  const studentName = searchParams.get('studentName');
  const fileName = searchParams.get('fileName');

  useEffect(() => {
    if (!productId) {
      toast({
        title: "Error",
        description: "No product specified for checkout.",
        variant: "destructive",
      });
      navigate('/parent/tools/iep-master-suite');
      return;
    }

    const product = getExpertReviewProduct(productId);
    if (!product) {
      toast({
        title: "Error", 
        description: "Invalid product selected.",
        variant: "destructive",
      });
      navigate('/parent/tools/iep-master-suite');
      return;
    }

    setProductInfo(product);

    // Create PaymentIntent for expert review
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/create-expert-review-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            productId,
            priceId: product.priceId,
            amount: product.amount,
            studentName,
            fileName,
            metadata: {
              product_type: 'expert-review',
              product_id: productId,
              student_name: studentName || '',
              file_name: fileName || '',
              user_email: user?.email || ''
            }
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create payment intent');
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        toast({
          title: "Payment Error",
          description: "Failed to initialize payment. Please try again.",
          variant: "destructive",
        });
        navigate('/parent/tools/iep-master-suite');
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [productId, studentName, fileName, user?.email, navigate, toast]);

  const handleSuccess = () => {
    toast({
      title: "Payment Successful!",
      description: "Your expert review request has been submitted. You'll receive updates via email.",
    });
    navigate('/parent/tools/expert-analysis?tab=results');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Setting up your payment...</p>
        </div>
      </div>
    );
  }

  if (!clientSecret || !productInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive">Payment setup failed. Please try again.</p>
            <Button 
              onClick={() => navigate('/parent/tools/iep-master-suite')} 
              className="mt-4"
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Expert Review Checkout</h1>
          <p className="text-gray-600">Complete your payment to submit your IEP for expert analysis</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="font-semibold">{productInfo.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{productInfo.description}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">${productInfo.amount}</Badge>
                  <Badge variant="outline">{productInfo.timeframe}</Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Includes:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {productInfo.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {studentName && (
                <div className="border-t pt-4">
                  <div className="text-sm">
                    <span className="font-medium">Student:</span> {studentName}
                  </div>
                  {fileName && (
                    <div className="text-sm mt-1">
                      <span className="font-medium">Document:</span> {fileName}
                    </div>
                  )}
                </div>
              )}

              <div className="border-t pt-4 flex justify-between items-center font-semibold">
                <span>Total:</span>
                <span className="text-lg">${productInfo.amount}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm productInfo={productInfo} onSuccess={handleSuccess} />
              </Elements>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}