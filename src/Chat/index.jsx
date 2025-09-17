import { useEffect, useRef, useState } from "react";
import axios from "axios";
import image from "../assets/robot.png";

function Chat() {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);


    useEffect(() => {
        scrollToBottom();
    }, [messages, loading, open]);


    function scrollToBottom() {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }

    const sendQuery = async (e) => {
        e.preventDefault()
        const q = input.trim();
        if (!q) return;

        const userMsg = { role: "user", text: q, timestamp: new Date() };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const resp = await axios.post(
                `${import.meta.env.VITE_APP_API_URL || 'http://localhost:4000'}/report`,
                { query: q },
                { timeout: 60000 }
            );
            const assistantMsg = {
                role: "assistant",
                text: `${resp.data.results?.length ?? 0} rows returned.`,
                results: resp.data.results,
                pipeline: resp.data.pipeline,
                explanation: resp.data.explanation,
                isValidQuery: resp.data.isValidQuery,
                detectedLanguage: resp.data.detectedLanguage,
                translationInfo: resp.data.translationInfo,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, assistantMsg]);
        } catch (err) {
            const errMsg = {
                role: "assistant",
                text: "Error: " + (err.response?.data?.error || err.message),
                timestamp: new Date(),
                isError: true,
            };
            setMessages((prev) => [...prev, errMsg]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <img
                src={image}
                className="rounded-full fixed bottom-10 right-10 bg-transparent cursor-pointer"
                height={100}
                width={100}
                onClick={() => setOpen(true)}
            />

            {open && (
                <div className="fixed inset-0 bg-neutral-200 flex items-center justify-center z-50">
                    <div className="w-full max-w-xl rounded-xl shadow-lg bg-white p-4 relative h-[70%]">
                        <div className="flex justify-between items-center">
                            <h2 className="font-bold text-lg">Chatbot</h2>
                            <div
                                className="text-white bg-neutral-900 px-4 py-2 rounded cursor-pointer"
                                onClick={() => setOpen(false)}
                            >
                                x
                            </div>
                        </div>

                        <div className="h-[80%] overflow-y-auto p-4  bg-neutral-50 my-4 rounded" aria-live="polite">
                            {messages.map((m) => (
                                <div key={m.id} className={`mb-3 flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] px-3 py-2 my-1 rounded-lg ${m.role === 'user' ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-900 font-medium'}`}>
                                        <div className="text-sm whitespace-wrap">{m.text}</div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="mt-3 flex flex-col gap-2 relative">
                            <textarea
                                className="flex-1 px-3 py-2 border border-neutral-200 rounded focus:outline-none"
                                placeholder="Type a message..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={loading}
                            />
                            <div className="w-full flex justify-end">
                                <div
                                    type="submit"
                                    className="text-white bg-neutral-900 px-7 py-2 rounded cursor-pointer w-25"
                                    disabled={loading}
                                    onClick={sendQuery}
                                >
                                    {loading ? '...' : 'Send'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Chat;
