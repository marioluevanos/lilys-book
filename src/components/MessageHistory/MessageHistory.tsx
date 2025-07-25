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
        h.role === "system" ? null : (
          <div
            key={String(h.content) + i}
            className={`message ${String(h.role)}`}
          >
            <p className="role">{String(h.role)}</p>
            <pre
              className="content"
              dangerouslySetInnerHTML={{
                __html: String(h.content),
              }}
            />
          </div>
        )
      )}
    </div>
  );
};
