export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/admin-dashboard/analytics',
      permanent: false,
    },
  }
}

export default function AnalyticsRedirect() {
  return null
}
