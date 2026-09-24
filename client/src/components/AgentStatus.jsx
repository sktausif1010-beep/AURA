import { ShieldCheck } from "lucide-react";

export default function AgentStatus() {
  return (
    <div className="agent-status">
      <div className="agent-status-icon">
        <ShieldCheck size={16} />
      </div>

      <div className="agent-status-content">
        <span className="agent-status-title">
          AURA AGENT
        </span>

        <div className="agent-status-online">
          <span className="agent-online-dot" />
          <span>Online</span>
        </div>
      </div>
    </div>
  );
}