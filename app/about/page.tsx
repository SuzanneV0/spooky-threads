import StaticPage from "@/components/StaticPage";

export const metadata = {
  title: "About",
  description: "The story behind Spooky Threads — Halloween-obsessed apparel and home goods.",
};

export default function AboutPage() {
  return (
    <StaticPage title="About Spooky Threads">
      <p>
        Spooky Threads started as a love letter to the best season of the year. We design cozy sweaters,
        soft tees, and playful home goods for people who wish it could be Halloween all year round.
      </p>
      <p>
        Every collection is stitched together with a little bit of mischief and a lot of care — from
        our Bats and Cats prints to our Cute Pumpkins lineup. This storefront is a practice build, so
        consider it our haunted little workshop while the real shop comes together behind the scenes.
      </p>
    </StaticPage>
  );
}
