const PartiesView = ({ parties, userFullName, userEmail }) => {
  if (!parties) return null;

  const { toParty = [], fromParty } = parties;

  return (
    <div
      className="container bg-white rounded shadow p-4 my-0"
      style={{ maxWidth: "1800px" }}
    >
      {/* TO Section */}
      <div className="mb-5 w-100 p-4">
        <div style={{ maxWidth: "500px", margin: "0 auto" }}>
          <h4 className="fw-bold text-secondary mb-1">Parties</h4>
          <div className="d-flex align-items-center text-secondary fw-semibold mb-2">
            <span className="text-dark fw-bold me-2">01</span>
            <span className="text-primary me-2">—</span>
            To
          </div>
        </div>

        {toParty.length > 0 ? (
          toParty.map((party, idx) => (
            <div
              key={idx}
              className="border rounded mx-auto position-relative mb-3"
              style={{ maxWidth: "500px" }}
            >
              <div className="row m-0 border-bottom">
                <div className="col-6 p-2 border-end">
                  <small className="text-muted d-block">Company</small>
                  <span className="fw-small">
                    {party.companyName || party.name}
                  </span>
                </div>
                <div className="col-6 p-2">
                  <small className="text-muted d-block">Reference</small>
                  <span className="fw-small">{party.name || "—"}</span>
                </div>
              </div>
              <div className="row m-0 border-bottom">
                <div className="col-12 p-2">
                  <small className="text-muted d-block">Email</small>
                  <span className="fw-small">{party.email}</span>
                </div>
              </div>
              <div className="row m-0">
                <div className="col-12 p-2">
                  <small className="text-muted d-block">Phone</small>
                  <span className="fw-small">{party.phone || "—"}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-muted">No recipients available.</p>
        )}
      </div>

      {/* FROM Section */}
      <div className="w-100 pb-4">
        <div
          className="d-flex justify-content-between align-items-center mb-2 text-secondary fw-semibold"
          style={{ maxWidth: "500px", margin: "0 auto" }}
        >
          <div className="d-flex align-items-center">
            <span className="text-dark fw-bold me-2">02</span>
            <span className="text-primary me-2">—</span>
            From
          </div>
        </div>

        <div
          className="border rounded bg-white mx-auto"
          style={{ maxWidth: "500px" }}
        >
          <div className="row m-0 border-bottom">
            <div className="col-6 p-2 border-end">
              <small className="text-muted d-block">Company</small>
              <span className="fw-small">
                {fromParty?.companyName ||
                  `${fromParty?.firstName || ""} ${fromParty?.lastName || ""}`}
              </span>
            </div>
            <div className="col-6 p-2">
              <small className="text-muted d-block">Reference</small>
              <span className="fw-small">{fromParty?.firstName || "—"}</span>
            </div>
          </div>
          <div className="row m-0 border-bottom">
            <div className="col-12 p-2">
              <small className="text-muted d-block">Email</small>
              <span className="fw-small">{fromParty?.email || userEmail}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartiesView;
