import { MobileTestingValidator } from '@/components/MobileTestingValidator';
import { OfflineTestComponent } from '@/components/OfflineTestComponent';

export default function MobileTestingPage() {
  return (
    <div className="min-h-screen bg-background">
      <MobileTestingValidator />
      
      {/* Offline Testing Component */}
      <div className="mt-12 border-t pt-12">
        <OfflineTestComponent />
      </div>
    </div>
  );
}