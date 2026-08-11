import { GoogleGenAI } from "@google/genai";

function getShowroomSystemInstruction(carsContext?: string, lang: string = 'ar') {
  return `أنت المساعد الذكي لمعرض "كادكس الجزائر - KADEX DZ"، المتخصص في استيراد أحدث السيارات الصينية الفاخرة والاقتصادية (مثل Geely, Chery, BYD, Jetour, Changan, DFSK, Great Wall Motors, Exeed) من الصين إلى جميع ولايات الجزائر.

مهامك ورسالتك:
1. إجابة استفسارات الزبائن الجزائريين باللغات التالية حسب رغبتهم: العربية (أو الدارجة الجزائرية المحترمة)، الفرنسية، أو الإنجليزية.
2. توضيح معطيات السيارات المتوفرة تسليم فوري في الجزائر، والسيارات الجاهزة للشحن من الموانئ الصينية (مع مدة الشحن التقريبية 30-45 يوماً).
3. تقديم معلومات قانونية وعامة مبسطة حول الاستيراد، التخليص الجمركي (Dédouanement)، إجراءات البطاقة الصفراء والرمادية، ورخص المجاهدين.
4. الإجابة بلباقة وإيجاز (خلال 2-4 جمل) وتوجيه العميل دائماً للاتصال برقم الهاتف أو الواتساب المباشر للمعرض لإتمام الحجز والطلبيات.

المخزون الحالي المتوفر بالمعرض:
${carsContext || 'يتوفر لدينا تشكيلة واسعة من سيارات شيري، جيلي، جيتور، بي واي دي، وشانجان.'}

معلومات الاتصال بالمعرض:
- الهاتف الأول: +213 550 12 34 56
- الهاتف الثاني: +213 770 98 76 54
- الواتساب: +213 550 12 34 56
- العنوان: حي البساتين، الشراقة، الجزائر العاصمة`;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { history, message, carsContext, language } = req.body || {};
    
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      return res.status(200).json({ 
        reply: "عذراً، يسعدنا تواصلكم المباشر مع معرض KADEX DZ عبر الهاتف +213 550 12 34 56 أو الواتساب."
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const chat = ai.chats.create({
      model: "gemini-3.6-flash",
      config: {
        systemInstruction: getShowroomSystemInstruction(carsContext, language),
      },
      history: Array.isArray(history) 
        ? history.map((h: { role: string; text: string }) => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }]
          }))
        : []
    });

    const result = await chat.sendMessage({ message: message || "مرحباً" });
    const replyText = result.text || "مرحباً بك في معرض KADEX DZ! كيف يمكننا مساعدتك اليوم؟";

    return res.status(200).json({ reply: replyText });

  } catch (error: any) {
    console.error("Gemini Server Error:", error);
    return res.status(200).json({ 
      reply: "أهلاً بك في معرض KADEX DZ! نسعد بخدمتك. للحصول على أسرع استجابة، يمكنك التواصل معنا مباشرة عبر الهاتف +213 550 12 34 56 أو الواتساب."
    });
  }
}
