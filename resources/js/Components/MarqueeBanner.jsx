const phrases = new Array(30).fill('🥖 CAPY & CO ☕');

export default function MarqueeBanner() {
    return (
        <div className="marquee-wrapper">
            <div className="marquee-track">
                {phrases.map((phrase, index) => (
                    <span key={`${phrase}-${index}`}>{phrase}</span>
                ))}
            </div>
        </div>
    );
}
