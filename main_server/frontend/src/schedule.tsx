import clarecoLogo from './assets/clareco.svg'

export function Schedule() {
    return (
        <>
            <header style={{
            position: 'sticky',
            top: 0,
            height: '60px',
            backgroundColor: 'white',
            borderBottom: '1px solid #ccc',
            color: '#fff',
            zIndex: 1000
            }}>
            <style>{'* { font-family: "LINE Seed JP"; }'}</style>
            <img src={clarecoLogo} alt="Clareco Logo" style={{ height: '40px', margin: '10px' }} />
            </header>
            <main style={{ }}
             className="content">
                <h1>ClassRecall</h1>
                <p>授業archiveシステム</p>
            </main>
        </>
    );
}
