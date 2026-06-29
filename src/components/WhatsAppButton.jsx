import './WhatsAppButton.css';

const WHATSAPP_NUMBER = '94765540871';
const DEFAULT_MESSAGE = 'Hi! I\'m reaching out from JobZone. I\'d like to know more about your services.';

export default function WhatsAppButton() {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-fab"
      id="whatsapp-button"
      aria-label="Chat on WhatsApp"
      title="Chat with us on WhatsApp"
    >
      <svg
        className="whatsapp-fab__icon"
        viewBox="0 0 32 32"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M16.004 2.003C8.27 2.003 2.004 8.27 2.004 16c0 2.474.646 4.89 1.872 7.016L2 30l7.193-1.852A13.94 13.94 0 0 0 16.004 30C23.732 30 30 23.73 30 16c0-3.737-1.456-7.25-4.1-9.893A13.89 13.89 0 0 0 16.004 2.003Zm0 2.56a11.4 11.4 0 0 1 8.104 3.358A11.38 11.38 0 0 1 27.44 16c0 6.31-5.13 11.44-11.436 11.44a11.38 11.38 0 0 1-5.804-1.588l-.405-.24-4.2 1.1 1.12-4.096-.264-.42A11.36 11.36 0 0 1 4.564 16c0-6.31 5.13-11.44 11.44-11.44Zm-3.26 6.19c-.233 0-.613.088-1.033.524-.42.437-1.604 1.567-1.604 3.822s1.642 4.434 1.87 4.74c.226.305 3.226 4.924 7.816 6.907 1.092.472 1.944.754 2.608.965.896.285 1.712.245 2.357.148.72-.107 2.215-.905 2.528-1.78.313-.876.313-1.627.22-1.782-.094-.156-.345-.25-.722-.438-.376-.19-2.228-1.1-2.573-1.225-.344-.125-.596-.19-.847.19-.25.378-.974 1.225-1.194 1.477-.22.252-.44.284-.817.095-.376-.19-1.59-.586-3.03-1.868-1.12-.998-1.877-2.231-2.097-2.608-.22-.378-.024-.582.165-.77.17-.17.376-.44.565-.66.188-.22.25-.378.376-.63.125-.25.063-.472-.032-.66-.094-.19-.847-2.04-1.16-2.793-.306-.734-.617-.634-.847-.646-.22-.01-.472-.012-.723-.012Z" />
      </svg>
      <span className="whatsapp-fab__pulse" />
    </a>
  );
}
