"use client";

import React, { useEffect, useState } from 'react'
import DeliveryPartnerSignUp from '../_components/DeliveryPartnerSignUp'
import DeliveryPartnerLogin from '../_components/DeliveryPartnerLogin'
import DeliveryPartnerHeader from '../_components/DeliveryPartnerHeader';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '../helper/fetchWithAuth';

const DeliveryPartner = () => {
    const router = useRouter();

    const [islogin, setIslogin] = useState(false);

    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {
        const getCurrentUser = async () => {
            try {
                const res = await fetchWithAuth("/api/deliverypartner/me");

                if (res.ok) {
                    router.replace("/deliverypartner/dashboard");
                    return;
                }
            } catch (error) {
                console.log(error);
            } finally {
                setCheckingAuth(false);
            }
        };

        getCurrentUser();
    }, [router]);

    if (checkingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Loading...
            </div>
        );
    }

    return (
        <>
            <DeliveryPartnerHeader />
            <main className="min-h-[calc(100vh-160px)] bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center px-6 py-10">
                {
                    islogin ? (
                        <DeliveryPartnerLogin setIslogin={setIslogin} />
                    ) : (
                        <DeliveryPartnerSignUp setIslogin={setIslogin} />
                    )
                }
            </main>
        </>
    )
}

export default DeliveryPartner