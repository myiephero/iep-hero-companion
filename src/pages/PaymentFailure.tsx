import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft, CreditCard, HelpCircle, RefreshCw } from 'lucide-react';

export default function PaymentFailure() {
  const location = useLocation();
  const navigate = useNavigate();
  const [errorDetails, setErrorDetails] = useState<any>(null);

  // Extract error details from URL params or location state
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const errorCode = urlParams.get('error_code');
    const errorMessage = urlParams.get('error_message');
    const declineCode = urlParams.get('decline_code');
    
    if (errorCode || errorMessage || declineCode || location.state?.error) {
      setErrorDetails({
        code: errorCode,
        message: errorMessage,
        declineCode: declineCode,
        ...location.state?.error
      });
    }
  }, [location]);

  const getErrorInfo = () => {
    if (!errorDetails) {
      return {
        title: "Payment Failed",
        description: "We weren't able to process your payment. Please try again with a different payment method.",
        icon: <AlertTriangle className="h-12 w-12 text-red-500" />,
        suggestions: [
          "Verify your card information is correct",
          "Try a different payment method", 
          "Contact your bank if the issue persists"
        ]
      };
    }

    const { code, declineCode, message } = errorDetails;
    
    if (code === 'card_declined' || declineCode) {
      return {
        title: "Card Declined",
        description: "Your card was declined by your bank. This is typically due to insufficient funds, spending limits, or security restrictions.",
        icon: <CreditCard className="h-12 w-12 text-red-500" />,
        suggestions: [
          "Check your account balance and available credit",
          "Contact your bank to verify the transaction",
          "Try a different payment method",
          "Make sure your billing address matches your card"
        ]
      };
    }
    
    if (code === 'insufficient_funds') {
      return {
        title: "Insufficient Funds",
        description: "Your account doesn't have enough funds to complete this purchase.",
        icon: <CreditCard className="h-12 w-12 text-orange-500" />,
        suggestions: [
          "Add funds to your account",
          "Try a different card with available balance",
          "Contact your bank for assistance"
        ]
      };
    }
    
    if (code === 'expired_card') {
      return {
        title: "Card Expired",
        description: "The card you're trying to use has expired.",
        icon: <CreditCard className="h-12 w-12 text-red-500" />,
        suggestions: [
          "Use an updated card with a valid expiration date",
          "Contact your bank for a replacement card",
          "Try a different payment method"
        ]
      };
    }
    
    if (code === 'incorrect_cvc') {
      return {
        title: "Invalid Security Code",
        description: "The security code (CVC) you entered is incorrect.",
        icon: <CreditCard className="h-12 w-12 text-red-500" />,
        suggestions: [
          "Check the 3-digit code on the back of your card",
          "For American Express, use the 4-digit code on the front",
          "Make sure you're entering the code correctly"
        ]
      };
    }
    
    // Default error handling
    return {
      title: "Payment Processing Error",
      description: message || "We encountered an unexpected error while processing your payment.",
      icon: <AlertTriangle className="h-12 w-12 text-red-500" />,
      suggestions: [
        "Try again in a few minutes",
        "Use a different payment method",
        "Contact support if the problem continues"
      ]
    };
  };

  const errorInfo = getErrorInfo();

  const handleRetryPayment = () => {
    // Get the original plan details from URL or go back to pricing
    const urlParams = new URLSearchParams(location.search);
    const planId = urlParams.get('plan');
    const role = urlParams.get('role');
    
    if (planId && role) {
      // Reconstruct the subscription setup URL
      navigate(`/subscription-setup?plan=${planId}&role=${role}&retry=true`);
    } else {
      // Go back to pricing page
      navigate('/pricing');
    }
  };

  const handleBackToPricing = () => {
    navigate('/pricing');
  };

  const handleContactSupport = () => {
    window.location.href = 'mailto:support@myiephero.com?subject=Payment%20Failed&body=I%20need%20help%20with%20a%20failed%20payment.';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        
        {/* Error Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
            {errorInfo.icon}
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {errorInfo.title}
            </h1>
            <p className="text-lg text-gray-600 max-w-lg mx-auto">
              {errorInfo.description}
            </p>
          </div>
        </div>

        {/* Error Details Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-red-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <HelpCircle className="h-5 w-5" />
              What can you do?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {errorInfo.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold mt-0.5">
                    {index + 1}
                  </span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>

            {/* Test Card Information for Development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">Testing Declined Payments?</h4>
                <p className="text-sm text-yellow-700 mb-2">
                  If you're testing with card number <code>4000 0000 0000 9995</code>, this decline is expected.
                </p>
                <p className="text-sm text-yellow-700">
                  Use <code>4242 4242 4242 4242</code> for successful test payments.
                </p>
              </div>
            )}

            {/* Debug Information for Development */}
            {process.env.NODE_ENV === 'development' && errorDetails && (
              <div className="mt-4 p-3 bg-gray-50 border rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Debug Information:</h4>
                <pre className="text-xs text-gray-600 overflow-auto">
                  {JSON.stringify(errorDetails, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={handleRetryPayment}
            className="flex-1 bg-primary hover:bg-primary-dark"
            size="lg"
            data-testid="button-retry-payment"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Try Different Payment Method
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleBackToPricing}
            className="flex-1"
            size="lg"
            data-testid="button-back-pricing"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Pricing
          </Button>
        </div>

        {/* Support Contact */}
        <div className="text-center pt-4">
          <p className="text-sm text-gray-600 mb-2">
            Still having trouble? We're here to help.
          </p>
          <Button 
            variant="ghost" 
            onClick={handleContactSupport}
            className="text-primary hover:text-primary-dark"
            data-testid="button-contact-support"
          >
            Contact Support
          </Button>
        </div>

        {/* Security Notice */}
        <div className="text-center text-xs text-gray-500 border-t pt-4">
          <p>
            Your payment information is secure and encrypted. We never store your card details.
          </p>
        </div>
      </div>
    </div>
  );
}