import React from 'react';

interface QueryResultProps {
  data: any;
}

const QueryResult: React.FC<QueryResultProps> = ({ data }) => {
  if (!data) return <div className="query-result empty">Aucun résultat</div>;

  if (data.error) {
    return (
      <div className="query-result error">
        <h3>Erreur</h3>
        <p>{data.error}</p>
      </div>
    );
  }

  if (Array.isArray(data)) {
    return (
      <div className="query-result">
        <h3>Résultats ({data.length})</h3>
        <div className="results-table">
          {data.length > 0 && (
            <table>
              <thead>
                <tr>
                  {Object.keys(data[0]).map(key => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value: any, i) => (
                      <td key={i}>{JSON.stringify(value)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="query-result">
      <h3>Résultat</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default QueryResult;
