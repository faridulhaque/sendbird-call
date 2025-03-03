import { useState, useEffect, useRef } from "react";
import SendBirdCall from "sendbird-calls";

const APP_ID = "B0B86EB9-306F-4829-BC75-5EAFEFAD6502"; // ✅ Your Sendbird Application ID

export default function App() {
  const [userId, setUserId] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [call, setCall] = useState<SendBirdCall.DirectCall | null>(null);
  const localAudioRef = useRef<HTMLAudioElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  // Initialize Sendbird Calls
  useEffect(() => {
    SendBirdCall.init(APP_ID);

    // ✅ Listen for incoming calls
    SendBirdCall.addListener("INCOMING_CALL_LISTENER", {
      onRinging: (incomingCall) => {
        setCall(incomingCall);
        alert(`Incoming call from ${incomingCall.caller.userId}`);

        if (window.confirm("Accept the call?")) {
          incomingCall.accept({
            callOption: {
              localMediaView: undefined,
              remoteMediaView: undefined,
              audioEnabled: true,
              videoEnabled: false,
            },
          });

          // ✅ Attach media streams
          incomingCall.onEstablished = () => {
            if (remoteAudioRef.current) {
              incomingCall.setRemoteMediaView(remoteAudioRef.current);
            }
            if (localAudioRef.current) {
              incomingCall.setLocalMediaView(localAudioRef.current);
            }
          };
        } else {
          incomingCall.end();
        }
      },
    });

    return () => {
      SendBirdCall.removeListener("INCOMING_CALL_LISTENER");
    };
  }, []);

  // Connect to Sendbird
  const connectToSendbird = async () => {
    if (!userId) return alert("Enter a User ID");

    try {
      await SendBirdCall.authenticate({ userId });
      await SendBirdCall.connectWebSocket();
      setIsConnected(true);
      alert("Connected to Sendbird!");
    } catch (error) {
      console.error("Connection error:", error);
    }
  };

  // Start an Audio Call
  const startCall = async (calleeId: string) => {
    if (!isConnected) return alert("Connect first!");

    const callOption = {
      localMediaView: undefined,
      remoteMediaView: undefined,
      audioEnabled: true,
      videoEnabled: false,
    };

    const newCall = SendBirdCall.dial({
      userId: calleeId,
      isVideoCall: false,
      callOption,
    });

    setCall(newCall);

    // ✅ Attach media streams
    newCall.onEstablished = () => {
      if (localAudioRef.current) {
        newCall.setLocalMediaView(localAudioRef.current);
      }
      if (remoteAudioRef.current) {
        newCall.setRemoteMediaView(remoteAudioRef.current);
      }
      alert("Call started!");
    };

    newCall.onEnded = () => {
      alert("Call ended!");
      setCall(null);
    };
  };

  // End the Call
  const endCall = () => {
    if (call) {
      call.end();
      setCall(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Audio Call App</h1>

      {/* User Authentication */}
      {!isConnected ? (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Enter your User ID"
            className="p-2 border rounded"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <button
            onClick={connectToSendbird}
            className="ml-2 p-2 bg-blue-500 text-white rounded"
          >
            Connect
          </button>
        </div>
      ) : (
        <p className="text-green-600">Connected as {userId}</p>
      )}

      {/* Call Controls */}
      {isConnected && (
        <div className="flex flex-col items-center space-y-4 mt-4">
          <input
            type="text"
            placeholder="Enter callee ID"
            className="p-2 border rounded"
            id="calleeId"
          />
          <button
            onClick={() =>
              startCall(
                (document.getElementById("calleeId") as HTMLInputElement).value
              )
            }
            className="p-2 bg-green-500 text-white rounded"
          >
            Start Call
          </button>
          {call && (
            <button
              onClick={endCall}
              className="p-2 bg-red-500 text-white rounded"
            >
              End Call
            </button>
          )}
        </div>
      )}

      {/* ✅ Audio Elements for Streaming */}
      <audio ref={localAudioRef} autoPlay muted />
      <audio ref={remoteAudioRef} autoPlay />
    </div>
  );
}
