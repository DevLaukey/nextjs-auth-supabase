import { supabaseClient } from "@/config/supabase-client";
import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSession, useSupabaseClient, useUser } from '@supabase/auth-helpers-react'


function Countdown() {
  const [timeChosen, setTimeChosen] = useState(3600); // 1 hour
  const [countdown, setCountdown] = useState(0);
  const [started, setStarted] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  // disable eslint
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    getTime()
  }, []);

  const startTimer = () => {
    setStarted(true);
    setIsRunning(true)
  };

 const session = useSession()
  const supabase = useSupabaseClient()
  const user = useUser();



  const getTime = async () => {
    try {
      let { data: time, error } = await supabaseClient
        .from('time')
        .select('stopped_at')
        .eq('id', user.id)


      if (time.length == 0) {
        setCountdown(3600)
        setTimeChosen(60 * 60)
        const { error } = await supabaseClient
          .from('time')
          .insert([
            {
              'id': user.id,
              'stopped_at': 3600,
              'created_at': new Date(),
            },
          ])


        if (error) throw error
      }
      else {
        setCountdown(time[0].stopped_at)

        const { error } = await supabaseClient
          .from('time')
          .update({ 'stopped_at': time[0].stopped_at })
          .eq('id', user.id)

        if (error) throw error
      }
      if (error) throw error

    } catch (error) {
      console.log(error)
    }
  }
  const stopTimer = async () => {
    if (isRunning == true) {
      toast.info("Timer Stopped", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: false,
      });
      try {

        const { error } = await supabaseClient
          .from('time')
          .update({ 'stopped_at': countdown })
          .eq('id', user.id)

        if (error) throw error
      } catch (error) {
        console.log(error)
      }

    }


    setIsRunning((prevIsRunning) => !prevIsRunning);
  };
  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
    }


    if (countdown === 0 && started == true) {
      clearInterval(interval);
      setStarted(false);
      toast.warning("Time Ended", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: false,
      });
      setIsRunning(false);
    }

    return () => clearInterval(interval);
  }, [countdown, started, isRunning]);

  const hours = Math.floor(countdown / 3600);
  const minutes = Math.floor((countdown % 3600) / 60);
  const seconds = countdown % 60;

  return (
    <>

      <div className="flex flex-col">
        <ToastContainer />
        <h2 className="w-full mx-1 p-2  text-yellow-700 rounded-lg text-center">
          The countdown runs for one hour
        </h2>

        <div className="text-6xl text-center flex w-full items-center justify-center">
          <div className="w-24 mx-1 p-2  text-yellow-500 rounded-lg">
            <div className="font-mono leading-none" x-text="hours">
              {hours}
            </div>
            <div className="font-mono uppercase text-sm leading-none">Hours</div>
          </div>
          <div className="text-2xl justify-center text-center mx-1 p-2  text-yellow-500 rounded-lg font-bold">
            :
          </div>

          <div className="w-24 mx-1 p-2  text-yellow-500 rounded-lg">
            <div className="font-mono leading-none" x-text="minutes">
              {minutes}
            </div>
            <div className="font-mono uppercase text-sm leading-none">Minutes</div>
          </div>
          <div className="text-2xl justify-center text-center mx-1 p-2  text-yellow-500 rounded-lg font-bold">
            :
          </div>
          <div className="w-24 mx-1 p-2  text-yellow-500 rounded-lg">
            <div className="font-mono leading-none" x-text="seconds">
              {`${seconds < 10 ? `0${seconds}` : seconds}`}
            </div>
            <div className="font-mono uppercase text-sm leading-none">Seconds</div>
          </div>
        </div>

        {started ? <button
          className="bg-transparent hover:bg-yellow-500 text-yellow-700 font-semibold hover:text-white py-2 px-4 border border-yellow-500 hover:border-transparent rounded"
          onClick={stopTimer}
        >      {isRunning ? 'Stop' : 'Resume'}  </button>
          : <button
            className="bg-transparent hover:bg-yellow-500 text-yellow-700 font-semibold hover:text-white py-2 px-4 border border-yellow-500 hover:border-transparent rounded"
            onClick={startTimer}
          >Start</button>}
            

      </div>
    </>
  );
}

export default Countdown;