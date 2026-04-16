interface GoogleAdsProps {
  slot?: string;
  format?: "horizontal" | "vertical" | "square";
}

const GoogleAds = ({ slot, format = "horizontal" }: GoogleAdsProps) => {
  const heightClass = format === "horizontal" ? "h-[90px]" : format === "vertical" ? "h-[250px]" : "h-[250px] max-w-[300px] mx-auto";

  return (
    <div className="py-3 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="rounded-xl border border-border bg-card/50 p-3 text-center">
          <p className="text-[10px] text-muted-foreground mb-1.5 font-heading uppercase tracking-wider">Publicidade</p>
          <div className={`bg-muted/50 rounded-lg ${heightClass} flex items-center justify-center text-xs text-muted-foreground`}>
            {slot ? (
              <ins
                className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-client="ca-pub-XXXXXXX"
                data-ad-slot={slot}
                data-ad-format="auto"
                data-full-width-responsive="true"
              />
            ) : (
              <span className="opacity-60">📢 Espaço para Google Ads — cole seu código AdSense aqui</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleAds;
