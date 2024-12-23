'use client';

import Script from 'next/script';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function Home() {
  // huhu

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <h1 style={styles.heading}>Welcome to Postman Collection</h1>
        <p style={styles.description}>
          Click the button below to fork the Postman collection and start using it.
        </p>

        <div
          className="postman-run-button"
          data-postman-action="collection/fork"
          data-postman-visibility="private"
          data-postman-var-1="23738835-1d348aac-a84d-4a5f-9a36-90089b69cd6a"
          data-postman-collection-url="entityId=23738835-1d348aac-a84d-4a5f-9a36-90089b69cd6a&entityType=collection&workspaceId=9824cab5-ac46-45d4-8c55-812e888baf45"
          style={styles.button}
        ></div>
        <Script
        src="https://run.pstmn.io/button.js"
        strategy="lazyOnload"
        onLoad={() => {
          (function (p, o, s, t, m, a, n) {
            if (!p[s]) {
              p[s] = function () {
                (p[t] || (p[t] = [])).push(arguments);
              };
            }
            if (!o.getElementById(s + t)) {
              const script = o.createElement('script');
              script.id = s + t;
              script.async = true;
              script.src = m;
              o.head.appendChild(script);
            }
          })(window, document, '_pm', 'PostmanRunObject', 'https://run.pstmn.io/button.js');
        }}
      />
      </div>
      <SwaggerUI url="/openapi.yaml" />
    </main>
  );
}

const styles = {
  main: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    // flex direction: 'column',
    flexDirection: 'column',
    padding: '20px',
  },
  container: {
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    maxWidth: '500px',
    width: '100%',
  },
  heading: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#333',
  },
  description: {
    fontSize: '1.1rem',
    color: '#666',
    marginBottom: '30px',
  },
  button: {
    // display: 'inline-block',
    // padding: '15px 30px',
    fontSize: '1rem',
    backgroundColor: '#007bff',
    color: '#ffffff',
    borderRadius: '5px',
    cursor: 'pointer',
    border: 'none',
    boxShadow: '0 3px 6px rgba(0, 0, 0, 0.1)',
    transition: 'background-color 0.3s ease',
  },
};
