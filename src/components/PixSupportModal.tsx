import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Heart, Sparkles, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addBonusCredits, logPixSupport, getBonusCredits } from "@/lib/localStore";
import { copyToClipboard } from "@/lib/share";
import mascotImg from "@/assets/mascot.png";

const PIX_KEY = "pixelnova-ai@support.pix";
const BONUS = 50;

export default function PixSupportModal({
  open, onOpenChange,
}: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [proof, setProof] = useState("");
  const [paid, setPaid] = useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard(PIX_KEY);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      toast({ title: "Chave Pix copiada ✨" });
    }
  };

  const handlePaid = () => {
    const total = addBonusCredits(BONUS);
    if (proof.trim()) logPixSupport(proof.trim());
    setPaid(true);
    toast({
      title: `Obrigado pelo apoio! +${BONUS} créditos bônus`,
      description: `Você agora tem ${total} créditos bônus locais.`,
    });
    setTimeout(() => {
      onOpenChange(false);
      setPaid(false);
      setProof("");
    }, 1800);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <img src={mascotImg} alt="Lumy" className="h-8 w-8 animate-float" />
            <DialogTitle className="font-heading text-lg gradient-text">
              Support PixelNova AI
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm">
            You can support this project via Pix to unlock more features. Apoio
            opcional — totalmente voluntário.
          </DialogDescription>
        </DialogHeader>

        {/* QR placeholder */}
        <div className="flex flex-col items-center gap-3 p-4 rounded-xl border border-border bg-muted/40">
          <div className="h-40 w-40 rounded-lg bg-background border border-border flex items-center justify-center">
            <QrCode className="h-24 w-24 text-foreground/80" strokeWidth={1.2} />
          </div>
          <p className="text-[10px] text-muted-foreground">QR Code de demonstração</p>
        </div>

        {/* Pix key */}
        <div>
          <label className="text-xs text-muted-foreground font-medium mb-1 block">
            Chave Pix
          </label>
          <div className="flex gap-2">
            <Input value={PIX_KEY} readOnly className="font-mono text-xs" />
            <Button type="button" variant="outline" size="icon" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Proof input */}
        <div>
          <label className="text-xs text-muted-foreground font-medium mb-1 block">
            Comprovante (opcional)
          </label>
          <Input
            value={proof}
            onChange={(e) => setProof(e.target.value)}
            placeholder="Cole o ID da transação ou observação"
          />
          <p className="text-[10px] text-muted-foreground mt-1">
            Sem verificação automática — confiança no apoio do usuário.
          </p>
        </div>

        {/* Action */}
        <Button
          onClick={handlePaid}
          disabled={paid}
          className="w-full font-semibold"
        >
          {paid ? (
            <><Check className="h-4 w-4" /> Obrigado!</>
          ) : (
            <><Heart className="h-4 w-4" /> Já paguei — receber +{BONUS} créditos</>
          )}
        </Button>

        <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1">
          <Sparkles className="h-3 w-3 text-primary" />
          Créditos bônus são salvos localmente no seu navegador. Saldo atual:{" "}
          {getBonusCredits()}
        </p>
      </DialogContent>
    </Dialog>
  );
}
