import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { createOrder } from '@/hooks/useOrderHistory';
import { toast } from 'sonner';
import type { ShippingAddress, PaymentInfo } from '@/types/ecommerce';

export function CheckoutForm() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'shipping' | 'payment' | 'confirm'>('shipping');

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  });

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('confirm');
  };

  const handleConfirmOrder = async () => {
    setIsProcessing(true);
    
    try {
      if (user) {
        // Save order to database for logged-in users
        await createOrder(
          user.id,
          cart,
          shippingAddress,
          `Card ending in ${paymentInfo.cardNumber.slice(-4)}`
        );
      }
      
      toast.success('Order placed successfully!');
      clearCart();
      navigate('/shop/order-success');
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const updateShipping = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }));
  };

  const updatePayment = (field: keyof PaymentInfo, value: string) => {
    setPaymentInfo((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center gap-4">
        <div className={`flex items-center gap-2 ${step === 'shipping' ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step === 'shipping' ? 'bg-primary text-primary-foreground' : 'bg-primary text-primary-foreground'}`}>
            {step === 'shipping' ? '1' : <Check className="h-4 w-4" />}
          </div>
          <span className="font-medium">Shipping</span>
          </div>
          <div className="flex-1 h-px bg-border" />
          <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step === 'payment' ? 'bg-primary text-primary-foreground' : step === 'confirm' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              {step === 'confirm' ? <Check className="h-4 w-4" /> : '2'}
            </div>
            <span className="font-medium">Payment</span>
          </div>
          <div className="flex-1 h-px bg-border" />
          <div className={`flex items-center gap-2 ${step === 'confirm' ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step === 'confirm' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              3
            </div>
            <span className="font-medium">Confirm</span>
          </div>
        </div>

        {/* Shipping Form */}
        {step === 'shipping' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleShippingSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={shippingAddress.firstName}
                      onChange={(e) => updateShipping('firstName', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={shippingAddress.lastName}
                      onChange={(e) => updateShipping('lastName', e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={shippingAddress.email}
                      onChange={(e) => updateShipping('email', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) => updateShipping('phone', e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={shippingAddress.address}
                    onChange={(e) => updateShipping('address', e.target.value)}
                    required
                  />
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={shippingAddress.city}
                      onChange={(e) => updateShipping('city', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={shippingAddress.state}
                      onChange={(e) => updateShipping('state', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={shippingAddress.zipCode}
                      onChange={(e) => updateShipping('zipCode', e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Continue to Payment
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Payment Form */}
        {step === 'payment' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardholderName">Cardholder Name</Label>
                  <Input
                    id="cardholderName"
                    value={paymentInfo.cardholderName}
                    onChange={(e) => updatePayment('cardholderName', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={paymentInfo.cardNumber}
                    onChange={(e) => updatePayment('cardNumber', e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      placeholder="MM/YY"
                      value={paymentInfo.expiryDate}
                      onChange={(e) => updatePayment('expiryDate', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={paymentInfo.cvv}
                      onChange={(e) => updatePayment('cvv', e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => setStep('shipping')}>
                    Back
                  </Button>
                  <Button type="submit" className="flex-1">
                    Review Order
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Order Confirmation */}
        {step === 'confirm' && (
          <Card>
            <CardHeader>
              <CardTitle>Review Your Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">Shipping Address</h4>
                <p className="text-sm text-muted-foreground">
                  {shippingAddress.firstName} {shippingAddress.lastName}<br />
                  {shippingAddress.address}<br />
                  {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}<br />
                  {shippingAddress.email} | {shippingAddress.phone}
                </p>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Payment Method</h4>
                <p className="text-sm text-muted-foreground">
                  Card ending in {paymentInfo.cardNumber.slice(-4)}
                </p>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Items</h4>
                <div className="space-y-2">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.product.name} x {item.quantity}</span>
                      <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => setStep('payment')}>
                  Back
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={handleConfirmOrder}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Place Order'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Order Summary */}
      <div>
        <Card className="sticky top-20">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="h-16 w-16 rounded-md object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    <p className="text-sm font-medium">${(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${cart.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>${cart.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{cart.shipping === 0 ? 'Free' : `$${cart.shipping.toFixed(2)}`}</span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>${cart.total.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
