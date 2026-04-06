import { useI18n } from "@/lib/i18n";
import { motion } from "framer-motion";
import { ExternalLink, CheckCircle2 } from "lucide-react";

const schemesData = [
  {
    id: "pm-kisan",
    name: "PM-Kisan Samman Nidhi",
    nameHi: "PM-किसान सम्मान निधि",
    nameTe: "PM-కిసాన్ సమ్మాన్ నిధి",
    eligibility: "All farmer families with cultivable land",
    eligibilityHi: "खेती योग्य भूमि वाले सभी किसान परिवार",
    eligibilityTe: "సాగు భూమి ఉన్న అన్ని రైతు కుటుంబాలు",
    benefits: "₹6,000/year in 3 installments directly to bank account",
    benefitsHi: "₹6,000/वर्ष 3 किस्तों में सीधे बैंक खाते में",
    benefitsTe: "₹6,000/సంవత్సరం 3 వాయిదాల్లో నేరుగా బ్యాంకు ఖాతాకు",
    link: "https://pmkisan.gov.in/",
    color: "bg-agri-success/10",
    iconColor: "text-agri-success",
  },
  {
    id: "pmfby",
    name: "PMFBY – Crop Insurance",
    nameHi: "PMFBY – फसल बीमा",
    nameTe: "PMFBY – పంట బీమా",
    eligibility: "All farmers growing notified crops",
    eligibilityHi: "अधिसूचित फसलें उगाने वाले सभी किसान",
    eligibilityTe: "నోటిఫైడ్ పంటలు పండించే అన్ని రైతులు",
    benefits: "Insurance coverage for crop loss due to natural calamities",
    benefitsHi: "प्राकृतिक आपदाओं से फसल हानि का बीमा कवरेज",
    benefitsTe: "ప్రకృతి విపత్తుల వల్ల పంట నష్టానికి బీమా కవరేజ్",
    link: "https://pmfby.gov.in/",
    color: "bg-agri-info/10",
    iconColor: "text-agri-info",
  },
  {
    id: "soil-health",
    name: "Soil Health Card",
    nameHi: "मृदा स्वास्थ्य कार्ड",
    nameTe: "నేల ఆరోగ్య కార్డ్",
    eligibility: "All farmers across India",
    eligibilityHi: "भारत भर के सभी किसान",
    eligibilityTe: "భారతదేశంలోని అన్ని రైతులు",
    benefits: "Free soil testing and crop-wise fertilizer recommendations",
    benefitsHi: "मुफ्त मिट्टी परीक्षण और फसलवार उर्वरक सिफारिशें",
    benefitsTe: "ఉచిత నేల పరీక్ష మరియు పంటవారీ ఎరువు సిఫారసులు",
    link: "https://soilhealth.dac.gov.in/",
    color: "bg-agri-warning/10",
    iconColor: "text-agri-warning",
  },
  {
    id: "enam",
    name: "eNAM – Online Market",
    nameHi: "eNAM – ऑनलाइन मंडी",
    nameTe: "eNAM – ఆన్‌లైన్ మార్కెట్",
    eligibility: "Farmers, traders, and FPOs registered on eNAM",
    eligibilityHi: "eNAM पर पंजीकृत किसान, व्यापारी और FPO",
    eligibilityTe: "eNAM లో నమోదైన రైతులు, వ్యాపారులు మరియు FPOలు",
    benefits: "Sell produce online at best price across India's mandis",
    benefitsHi: "भारत की मंडियों में सर्वोत्तम मूल्य पर ऑनलाइन उत्पाद बेचें",
    benefitsTe: "భారతదేశంలోని మండీలలో ఉత్తమ ధరకు ఆన్‌లైన్‌లో ఉత్పత్తులు విక్రయించండి",
    link: "https://enam.gov.in/",
    color: "bg-primary/10",
    iconColor: "text-foreground",
  },
  {
    id: "kcc",
    name: "Kisan Credit Card",
    nameHi: "किसान क्रेडिट कार्ड",
    nameTe: "కిసాన్ క్రెడిట్ కార్డ్",
    eligibility: "Individual/joint farmers, SHGs, and tenant farmers",
    eligibilityHi: "व्यक्तिगत/संयुक्त किसान, SHG और किरायेदार किसान",
    eligibilityTe: "వ్యక్తిగత/సంయుక్త రైతులు, SHGలు మరియు కౌలు రైతులు",
    benefits: "Credit up to ₹3 lakh at 4% interest for crop cultivation",
    benefitsHi: "फसल खेती के लिए 4% ब्याज पर ₹3 लाख तक का ऋण",
    benefitsTe: "పంట సాగు కోసం 4% వడ్డీతో ₹3 లక్షల వరకు రుణం",
    link: "https://www.pmkisan.gov.in/",
    color: "bg-agri-success/10",
    iconColor: "text-agri-success",
  },
];

export default function SchemesPage() {
  const { t, lang } = useI18n();

  const getName = (s: typeof schemesData[0]) =>
    lang === "hi" ? s.nameHi : lang === "te" ? s.nameTe : s.name;
  const getEligibility = (s: typeof schemesData[0]) =>
    lang === "hi" ? s.eligibilityHi : lang === "te" ? s.eligibilityTe : s.eligibility;
  const getBenefits = (s: typeof schemesData[0]) =>
    lang === "hi" ? s.benefitsHi : lang === "te" ? s.benefitsTe : s.benefits;

  return (
    <div className="px-4 py-4 max-w-screen-md mx-auto">
      <h2 className="text-xl font-bold text-foreground mb-4">{t("govSchemes")}</h2>
      <div className="space-y-3">
        {schemesData.map((scheme, i) => (
          <motion.div
            key={scheme.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="agri-card-hover p-4"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-foreground text-sm">{getName(scheme)}</h3>
              <div className={`${scheme.color} ${scheme.iconColor} p-1.5 rounded-lg`}>
                <CheckCircle2 size={14} />
              </div>
            </div>

            <div className="space-y-2 mb-3">
              <div>
                <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                  {t("eligibility")}
                </span>
                <p className="text-xs text-foreground">{getEligibility(scheme)}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                  {t("benefits")}
                </span>
                <p className="text-xs text-foreground">{getBenefits(scheme)}</p>
              </div>
            </div>

            <a
              href={scheme.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold tap-target"
            >
              {t("apply")}
              <ExternalLink size={12} />
            </a>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
