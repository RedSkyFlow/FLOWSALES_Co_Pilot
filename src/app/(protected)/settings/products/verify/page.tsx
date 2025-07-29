'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { z } from 'zod';
import { ingestAndAnalyzeConfiguratorFlow } from '@/ai/flows/ingest-and-analyze-configurator';
import { useState, useEffect } from 'react';
import { useAuth } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { User } from '@/lib/types';

const productsSchema = z.array(z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
}));

const rulesSchema = z.array(z.object({
  type: z.string(),
  productIds: z.array(z.string()),
}));

type Products = z.infer<typeof productsSchema>;
type Rules = z.infer<typeof rulesSchema>;

export default function BulkVerificationPage() {
  const [products, setProducts] = useState<Products>([]);
  const [rules, setRules] = useState<Rules>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, loading] = useAuth(auth);
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setSubscriptionTier(userData.subscription?.tier || 'free');
        }
      }
    };
    fetchSubscription();
  }, [user]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      try {
        const result = await ingestAndAnalyzeConfiguratorFlow({ documentContent: content, userId: user.uid });
        setProducts(result.products);
        setRules(result.rules);
      } catch (error) {
        console.error("Error analyzing document:", error);
        // You might want to show a toast or an alert to the user here
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleApproveAll = () => {
    // Logic to approve all products and rules will be added here
    console.log("Approved:", { products, rules });
  };

  const isPremium = subscriptionTier === 'premium';

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Bulk Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            {loading ? (
              <p>Loading...</p>
            ) : isPremium ? (
              <>
                <input type="file" onChange={handleFileChange} disabled={isLoading} />
                {isLoading && <p>Analyzing document...</p>}
              </>
            ) : (
              <div className="text-center p-4 border-2 border-dashed rounded-lg">
                <p className="mb-2">This is a premium feature.</p>
                <Button>Upgrade to Premium</Button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">Products</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.id}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.price}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">Rules</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Product IDs</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((rule, index) => (
                    <TableRow key={index}>
                      <TableCell>{rule.type}</TableCell>
                      <TableCell>{rule.productIds.join(', ')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={handleApproveAll} disabled={products.length === 0 || !isPremium}>Approve All</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
