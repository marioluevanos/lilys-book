import "./MessageHistory.css";
import { FC } from "react";
import { History } from "../../types";

type MessageHistoryProps = {
  history: History[];
};

export const MessageHistory: FC<MessageHistoryProps> = (props) => {
  const { history } = props;
  return (
    <div className="message-history">
      {history.map((h, i) =>
        h.role === "assistant" ? (
          <div
            key={String(h.content) + i}
            className={`message ${String(h.role)}`}
          >
            <p className="role">{String(h.role)}</p>

            <details className="content code">
              <summary>Code</summary>
              <div
                dangerouslySetInnerHTML={{
                  __html: String(h.content),
                }}
              ></div>
            </details>
          </div>
        ) : null
      )}
    </div>
  );
};
