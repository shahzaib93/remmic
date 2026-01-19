export default function InvestmentModelsRedirect() {
  return null
}

export const getServerSideProps = async () => {
  return {
    redirect: {
      destination: '/investment-shares',
      permanent: false,
    },
  }
}
