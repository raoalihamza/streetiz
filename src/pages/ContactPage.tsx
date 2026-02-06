import { useState } from 'react';
import { Mail, Instagram, Music, Youtube, Send, MapPin, Phone } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4 animate-slide-up">
          <div className="badge-pill inline-flex">
            <Mail className="w-3 h-3 mr-2" />
            Contact
          </div>
          <h1 className="text-5xl md:text-6xl font-black">
            <span className="text-white">Contactez </span>
            <span className="text-streetiz-red glow-red">STREETIZ</span>
          </h1>
          <p className="text-xl text-[#a0a0a0] max-w-2xl mx-auto">
            Une question ? Un projet ? Un event à proposer ? Écrivez-nous !
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="card-premium p-8 animate-fade-in">
              <h2 className="text-2xl font-bold mb-6">Envoyez-nous un message</h2>

              {submitted && (
                <div className="mb-6 p-4 bg-streetiz-red/10 border border-streetiz-red/20 rounded-xl">
                  <p className="text-streetiz-red font-semibold">
                    Message envoyé avec succès ! Nous vous répondrons rapidement.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Nom</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-urban w-full"
                      placeholder="Votre nom"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-urban w-full"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Sujet</label>
                  <select
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="input-urban w-full"
                  >
                    <option value="">Sélectionnez un sujet</option>
                    <option value="event">Proposer un event</option>
                    <option value="partnership">Partenariat</option>
                    <option value="captation">Demander une captation</option>
                    <option value="promo">Promotion / Communication</option>
                    <option value="press">Presse / Média</option>
                    <option value="other">Autre demande</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Message</label>
                  <textarea
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="input-urban w-full min-h-[160px] resize-none"
                    placeholder="Décrivez votre projet, votre demande..."
                  />
                </div>

                <button type="submit" className="btn-primary w-full flex items-center justify-center space-x-2">
                  <Send className="w-5 h-5" />
                  <span>Envoyer le message</span>
                </button>
              </form>
            </div>
          </div>

          <div className="space-y-6 animate-fade-in">
            <div className="card-premium p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Mail className="w-5 h-5 text-streetiz-red mr-2" />
                Email
              </h3>
              <a
                href="mailto:contact@streetiz.com"
                className="text-[#a0a0a0] hover:text-streetiz-red transition-colors"
              >
                contact@streetiz.com
              </a>
            </div>

            <div className="card-premium p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <MapPin className="w-5 h-5 text-streetiz-red mr-2" />
                Localisation
              </h3>
              <p className="text-[#a0a0a0]">
                Paris, France<br />
                Worldwide Coverage
              </p>
            </div>

            <div className="card-premium p-6">
              <h3 className="text-xl font-bold mb-4">Suivez-nous</h3>
              <div className="space-y-3">
                <a
                  href="https://instagram.com/streetiz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-3 rounded-xl hover:bg-[#1a1a1a] transition-colors group"
                >
                  <div className="w-10 h-10 bg-[#1a1a1a] rounded-full flex items-center justify-center group-hover:bg-streetiz-red transition-colors">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <span className="text-[#a0a0a0] group-hover:text-white transition-colors">
                    @streetiz
                  </span>
                </a>

                <a
                  href="https://tiktok.com/@streetiz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-3 rounded-xl hover:bg-[#1a1a1a] transition-colors group"
                >
                  <div className="w-10 h-10 bg-[#1a1a1a] rounded-full flex items-center justify-center group-hover:bg-streetiz-red transition-colors">
                    <Music className="w-5 h-5" />
                  </div>
                  <span className="text-[#a0a0a0] group-hover:text-white transition-colors">
                    @streetiz
                  </span>
                </a>

                <a
                  href="https://youtube.com/@streetiz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-3 rounded-xl hover:bg-[#1a1a1a] transition-colors group"
                >
                  <div className="w-10 h-10 bg-[#1a1a1a] rounded-full flex items-center justify-center group-hover:bg-streetiz-red transition-colors">
                    <Youtube className="w-5 h-5" />
                  </div>
                  <span className="text-[#a0a0a0] group-hover:text-white transition-colors">
                    STREETIZ
                  </span>
                </a>
              </div>
            </div>

            <div className="card-premium p-6 bg-gradient-to-br from-streetiz-red/10 to-transparent border-streetiz-red/20">
              <h3 className="text-xl font-bold mb-2">Vous organisez un event ?</h3>
              <p className="text-sm text-[#a0a0a0] mb-4">
                Profitez de notre réseau pour promouvoir votre soirée, battle ou festival.
              </p>
              <button className="btn-primary w-full text-sm">
                Proposer mon event
              </button>
            </div>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-6 animate-fade-in">
          <div className="card-premium p-6 text-center">
            <div className="w-12 h-12 bg-streetiz-red/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-streetiz-red" />
            </div>
            <h3 className="font-bold mb-2">Support</h3>
            <p className="text-sm text-[#a0a0a0]">
              Réponse sous 48h ouvrées
            </p>
          </div>

          <div className="card-premium p-6 text-center">
            <div className="w-12 h-12 bg-streetiz-red/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Music className="w-6 h-6 text-streetiz-red" />
            </div>
            <h3 className="font-bold mb-2">Captation Pro</h3>
            <p className="text-sm text-[#a0a0a0]">
              Filmage événements & battles
            </p>
          </div>

          <div className="card-premium p-6 text-center">
            <div className="w-12 h-12 bg-streetiz-red/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Send className="w-6 h-6 text-streetiz-red" />
            </div>
            <h3 className="font-bold mb-2">Partenariat</h3>
            <p className="text-sm text-[#a0a0a0]">
              Collaborations marques & médias
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
