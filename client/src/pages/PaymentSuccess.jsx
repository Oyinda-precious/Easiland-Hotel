import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const PaymentSuccess = () => {

  const [searchParams] = useSearchParams();
  const { axios } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {

    const verifyPayment = async () => {

      const reference = searchParams.get("reference");

      const { data } = await axios.get(
        `/api/bookings/verify-payment?reference=${reference}`
      );

      if(data.success){
        navigate("/my-bookings");
      }

    };

    verifyPayment();

  }, []);

  return <p>Verifying payment...</p>;
};

export default PaymentSuccess;