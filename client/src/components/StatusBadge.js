
export default function StatusBadge({ status }) {
    return (
        <span className={`badge badge-${status} px-3 py-1`} style={{ borderRadius: 20 }}>
            {status}
        </span>
    );
}
