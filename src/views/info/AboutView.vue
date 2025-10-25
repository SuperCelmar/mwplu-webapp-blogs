<template>
  <AppLayout :has-breadcrumbs="true">
    <template #breadcrumbs>
      <BreadcrumbNav :items="breadcrumbItems" />
    </template>

    <div class="container">
      <h1>À propos de MWPLU</h1>
      <p>MWPLU est une plateforme dédiée à la simplification de l'accès aux documents d'urbanisme. Notre mission est de rendre l'information sur l'aménagement du territoire plus accessible et compréhensible pour tous.</p>

      <section class="team-section">
        <h2>Notre équipe</h2>
        <div class="team-grid">

          <div class="team-member">
            <div class="member-photo">
              <img src="@/assets/images/jimmy-mugisha.webp" alt="Jimmy Mugisha" />
            </div>
            <h3>Jimmy Mugisha</h3>
            <p class="role-placeholder">Architecte<br>(Compositeur)</p>
          </div>

          <div class="team-member">
            <div class="member-photo">
              <img src="@/assets/images/rim-ennaciri.webp" alt="Rim Ennaciri" />
            </div>
            <h3>Rim Ennaciri</h3>
            <p class="role-placeholder">Architecte<br>(Direction Stratégique)</p>
          </div>

          <div class="team-member">
            <div class="member-photo">
              <img src="@/assets/images/matthieu-guiller.webp" alt="Matthieu Guiller" />
            </div>
            <h3>Matthieu Guiller</h3>
            <p class="role-placeholder">Architecte<br>(Réalisateur)</p>
          </div>

          <div class="team-member">
            <div class="member-photo">
              <img src="@/assets/images/marcel-lin.webp" alt="Marcel Lin" />
            </div>
            <h3>Marcel Lin</h3>
            <p class="role-placeholder">Ingénieur<br>(Full Stack)</p>
          </div>

          <div class="team-member">
            <div class="member-photo">
              <img src="@/assets/images/pierre-monnier.webp" alt="Pierre Monnier" />
            </div>
            <h3>Pierre Monnier</h3>
            <p class="role-placeholder">Architecte<br>(Conseiller)</p>
          </div>

          <div class="team-member">
            <div class="member-photo">
              <img src="@/assets/images/florent-lin.webp" alt="Florent Lin" />
            </div>
            <h3>Florent Lin</h3>
            <p class="role-placeholder">Ingénieur<br>(Data Scientist)</p>
          </div>

          <div class="team-member">
            <div class="member-photo">
              <img src="@/assets/images/zakaria-touati.webp" alt="Zakaria Touati" />
            </div>
            <h3>Zakaria Touati</h3>
            <p class="role-placeholder">Architecte<br>(Directeur de projet)</p>
          </div>
        </div>
      </section>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import BreadcrumbNav from '@/components/layout/BreadcrumbNav.vue'

const breadcrumbItems = [
  { label: 'À propos', to: '/about' }
]
</script>

<style scoped>
.container {
  padding: var(--space-6) var(--space-8);
  max-width: 1000px;
  margin: 0 auto;
}

h1 {
  font-size: var(--font-size-2xl);
  color: var(--color-black);
  margin-bottom: var(--space-4);
}

p {
  font-size: var(--font-size-md);
  color: var(--color-gray-700);
  line-height: 1.6;
  margin-bottom: var(--space-6);
}

.team-section {
  margin-top: var(--space-12);
}

.team-section h2 {
  font-size: var(--font-size-xl);
  color: var(--color-black);
  margin-bottom: var(--space-8);
  text-align: center;
}

.team-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-8);
  margin-top: var(--space-6);
  justify-content: center;
}

.team-member {
  text-align: center;
  padding: var(--space-6);
  border-radius: 2px;
  background: var(--color-white);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s ease;
  width: 280px;
  flex-shrink: 0;
}

.team-member:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.member-photo {
  width: 180px;
  height: 180px;
  margin: 0 auto var(--space-4);
  overflow: hidden;
  border-radius: 1px;
}

.member-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.team-member h3 {
  font-size: var(--font-size-lg);
  color: var(--color-black);
  margin-bottom: var(--space-2);
  font-weight: 600;
}

.role-placeholder {
  font-size: var(--font-size-sm);
  color: var(--color-gray-500);
  font-style: italic;
  margin: 0;
}

@media (max-width: 768px) {
  .team-grid {
    gap: var(--space-6);
  }

  .team-member {
    padding: var(--space-4);
    width: 250px;
  }

  .member-photo {
    width: 140px;
    height: 140px;
  }
}
</style>
