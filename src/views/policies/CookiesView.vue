<template>
  <AppLayout>
    <main class="policy-container">
      <h1>POLITIQUE DES COOKIES</h1>
      <div class="last-update">
        Dernière mise à jour : 13 mai 2025
      </div>

      <div class="article">
        <h2>1. Qu'est-ce qu'un cookie ?</h2>
        <p>
          Un cookie est un petit fichier texte stocké sur votre appareil (ordinateur, tablette, smartphone) lorsque vous visitez un site web. Les cookies permettent au site de reconnaître votre appareil et de mémoriser certaines informations sur vos préférences ou actions passées, ce qui améliore votre expérience de navigation et permet l'analyse de l'utilisation du site.
        </p>
      </div>

      <div class="article">
        <h2>2. Types de cookies utilisés par MWPLU</h2>
        <p>MWPLU utilise les types de cookies suivants :</p>
        <ul>
          <li>
            <strong>Cookies strictement nécessaires :</strong> Ces cookies sont indispensables au bon fonctionnement de notre site web. Ils permettent des fonctionnalités de base comme l'authentification des utilisateurs, la gestion de la sécurité et la navigation essentielle sur le site. Leur désactivation pourrait rendre certaines parties du site inutilisables. La base légale de leur utilisation est l'intérêt légitime de MWPLU à assurer le fonctionnement technique du site.
          </li>
          <li>
            <strong>Cookies de performance et d'analyse :</strong> Ces cookies collectent des informations anonymes sur la manière dont les visiteurs utilisent notre site (par exemple, les pages les plus visitées, les temps de chargement, les erreurs rencontrées). Ces données nous aident à comprendre le comportement des utilisateurs et à améliorer la performance et l'ergonomie de notre site web. L'utilisation de ces cookies est soumise à votre consentement préalable.
          </li>
          <li>
            <strong>Cookies fonctionnels :</strong> Ces cookies mémorisent vos choix et préférences (comme la langue ou les paramètres d'affichage) pour vous offrir une expérience utilisateur plus personnalisée et plus fluide lors de vos visites ultérieures. L'utilisation de ces cookies est soumise à votre consentement préalable.
          </li>
          <li>
            <strong>Cookies de sécurité :</strong> Ces cookies sont spécifiquement utilisés pour renforcer la sécurité de notre site, notamment pour protéger contre les abus automatisés et les tentatives de spam (par exemple, via des systèmes de CAPTCHA). La base légale de leur utilisation est l'intérêt légitime de MWPLU à assurer la sécurité de son service et la protection de ses utilisateurs.
          </li>
        </ul>
      </div>

      <div class="article">
        <h2>3. Cookies tiers</h2>
        <p>Nous utilisons des services tiers qui peuvent déposer leurs propres cookies sur votre appareil. L'utilisation de ces cookies est soumise à votre consentement, sauf pour ceux strictement nécessaires au service.</p>
        <ul>
          <li>
            <strong>Supabase :</strong> Utilisé pour la gestion de l'authentification des utilisateurs (connexion, inscription), le stockage des données et les fonctions de base de notre base de données. Supabase peut déposer des cookies essentiels pour maintenir votre session active et sécurisée.
          </li>
          <li>
            <strong>Cloudflare Turnstile :</strong> Un service de Cloudflare que nous utilisons pour distinguer les humains des bots et protéger notre site contre les activités automatisées malveillantes (anti-spam et sécurité). Il peut déposer des cookies de sécurité à cette fin.
          </li>
          <li>
            <strong>Google Analytics (GA4) :</strong>
            <p>
              Qu'est-ce que Google Analytics ? Google Analytics est un service d'analyse web fourni par Google qui nous permet de mesurer et d'analyser le trafic et le comportement des utilisateurs sur notre site. Il nous aide à comprendre comment les visiteurs interagissent avec notre site, quelles pages sont populaires, d'où viennent nos utilisateurs, etc.
            </p>
            <p>
              Comment MWPLU utilise Google Analytics (GA4) : Nous avons configuré une propriété GA4 pour collecter des données sur :
            </p>
            <ul>
              <li>Les vues de pages (pages visitées).</li>
              <li>Le suivi de l'ID utilisateur (un identifiant unique et pseudonymisé/haché attribué à chaque utilisateur, qui ne permet pas votre identification directe) pour avoir une vue consolidée de votre parcours sur notre site, même si vous changez d'appareil.</li>
              <li>Des dimensions personnalisées pour catégoriser les types d'utilisateurs.</li>
            </ul>
            <p>Événements spécifiques tracés : Nous suivons des événements personnalisés pour mieux comprendre les interactions sur notre plateforme. Cela inclut :</p>
            <ul>
              <li>Événements d'authentification : `login` (connexion réussie), `signup` (inscription), `logout` (déconnexion).</li>
              <li>Événements d'interaction avec le PLU : `plu_view` (consultation d'une synthèse de PLU), `plu_download` (téléchargement d'un document), `plu_comment` (ajout d'un commentaire), `plu_rate` (notation d'un document).</li>
              <li>Événements de parcours utilisateur : `city_selected` (sélection d'une ville ou métropole), `zone_selected` (sélection complète d'une zone), `search_performed` (si une recherche est effectuée).</li>
              <li>Événements de conversion : `contact_form_submitted` (soumission d'un formulaire de contact), ainsi que `payment_initiated` et `subscription_completed` pour nos futures fonctionnalités de paiement et d'abonnement.</li>
            </ul>
            <p>Confidentialité et conformité avec Google Analytics : Afin de respecter votre vie privée et d'assurer la conformité au RGPD, nous avons implémenté les mesures suivantes pour Google Analytics :</p>
            <ul>
              <li>Anonymisation des adresses IP : Votre adresse IP est systématiquement anonymisée (tronquée) avant d'être stockée par Google, de sorte qu'elle ne peut plus être utilisée pour vous identifier.</li>
              <li>Nous ne partageons pas les données brutes de Google Analytics avec d'autres services Google à des fins publicitaires.</li>
              <li>Les données collectées via Google Analytics ne sont utilisées que pour l'analyse du comportement des utilisateurs sur notre site et l'amélioration de nos services.</li>
            </ul>
          </li>
        </ul>
      </div>

      <div class="article">
        <h2>4. Votre Consentement et Gestion des cookies (Le Bandeau Cookie)</h2>
        <p>
          Dès votre première visite sur notre site, un bandeau de consentement aux cookies apparaît. Ce bandeau vous informe de l'utilisation des cookies et vous offre les options suivantes :
        </p>
        <ul>
          <li>
            <strong>Accepter tout :</strong> En cliquant sur ce bouton, vous consentez au dépôt de tous les cookies (nécessaires, de performance, fonctionnels, de sécurité et d'analyse).
          </li>
          <li>
            <strong>Refuser tout :</strong> En cliquant sur ce bouton, vous refusez le dépôt de tous les cookies non-essentiels. Seuls les cookies strictement nécessaires au fonctionnement du site seront conservés.
          </li>
          <li>
            <strong>Gérer mes préférences / Personnaliser :</strong> Ce lien vous permet d'accéder à un panneau de contrôle où vous pouvez donner ou retirer votre consentement pour chaque catégorie de cookies (performance, fonctionnels, analyse) de manière granulaire.
          </li>
        </ul>
        <p>
          Votre choix est enregistré et vous pouvez le modifier à tout moment en cliquant sur le lien "Gestion des Cookies" (ou un lien similaire) généralement situé dans le pied de page de notre site.
        </p>
      </div>

      <div class="article">
        <h2>5. Conséquences de la désactivation</h2>
        <p>Attention : La désactivation de certains cookies peut affecter le fonctionnement du site. En particulier :</p>
        <ul>
          <li>
            Les cookies strictement nécessaires étant essentiels, leur blocage total via les paramètres de votre navigateur peut empêcher la connexion ou le maintien de votre session.
          </li>
          <li>La perte des préférences et paramètres personnalisés.</li>
          <li>Des fonctionnalités réduites ou indisponibles (par exemple, si vous bloquez les cookies fonctionnels).</li>
          <li>Le blocage des cookies d'analyse (Google Analytics) n'affectera pas le fonctionnement du site mais nous privera d'informations précieuses pour l'améliorer.</li>
        </ul>
      </div>

      <div class="article">
        <h2>6. Durée de conservation</h2>
        <p>Les cookies sont conservés pour les durées suivantes :</p>
        <ul>
          <li>
            <strong>Cookies de session :</strong> Supprimés automatiquement à la fermeture de votre navigateur.
          </li>
          <li>
            <strong>Cookies persistants :</strong> Restent sur votre appareil pour une durée définie, généralement entre 30 jours et 2 ans selon leur fonction (par exemple, les cookies de préférences ou d'analyse).
          </li>
          <li>
            <strong>Cookies d'authentification :</strong> Conservés jusqu'à votre déconnexion manuelle.
          </li>
        </ul>
      </div>

      <div class="article">
        <h2>7. Vos Droits</h2>
        <p>
          Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez de droits concernant vos données personnelles, y compris celles collectées via les cookies : droit d'accès, de rectification, d'effacement, de limitation du traitement, d'opposition au traitement et de portabilité des données. Pour exercer ces droits, veuillez-vous référer à notre Politique de Confidentialité pour les détails complets et la procédure à suivre.
        </p>
      </div>

      <div class="article">
        <h2>8. Le Responsable de Traitement</h2>
        <p>
          Le responsable du traitement de vos données personnelles collectées via ce site web, y compris les données des cookies, est :<br>
          MEWE PARTNERS SAS
        </p>
      </div>

      <div class="article">
        <h2>9. Contact</h2>
        <p>
          Pour toute question concernant notre politique des cookies, vous pouvez nous contacter à l'adresse suivante :
        </p>
        <ul>
          <li>Email : contact@mwplu.com</li>
          <li>Adresse : 40 Rue Mallifaud, 38100 Grenoble, France</li>
        </ul>
      </div>
    </main>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
</script>

<style scoped>
@import '../../styles/pages/policy-styles.css';
</style>
