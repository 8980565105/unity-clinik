import Row from "../ui/Row";
import Section from "../ui/Section";

export default function ReportCard() {
    const reviews =
        [
            {
                image:
                    "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600",
                stage: "Stage 2",
                title: "Skeptical at first, but happy with Minoxidil",
                description:
                    "I was initially skeptical about hair growth products, but Minoxidil proved me wrong. With regular application over 6 months, my thinning patches are now covered with new hair growth.",
                name: "Rohit",
                age: 20,
                rating: 4.5,
            },
            {
                image:
                    "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600",
                stage: "Stage 2",
                title: "Skeptical at first, but happy with Minoxidil",
                description:
                    "I was initially skeptical about hair growth products, but Minoxidil proved me wrong. With regular application over 6 months, my thinning patches are now covered with new hair growth.",
                name: "Rohit",
                age: 20,
                rating: 4.5,
            },
            {
                image:
                    "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600",
                stage: "Stage 2",
                title: "Skeptical at first, but happy with Minoxidil",
                description:
                    "I was initially skeptical about hair growth products, but Minoxidil proved me wrong. With regular application over 6 months, my thinning patches are now covered with new hair growth.",
                name: "Rohit",
                age: 20,
                rating: 4.5,
            },
            {
                image:
                    "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600",
                stage: "Stage 2",
                title: "Skeptical at first, but happy with Minoxidil",
                description:
                    "I was initially skeptical about hair growth products, but Minoxidil proved me wrong. With regular application over 6 months, my thinning patches are now covered with new hair growth.",
                name: "Rohit",
                age: 20,
                rating: 4.5,
            },
            {
                image:
                    "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600",
                stage: "Stage 2",
                title: "Skeptical at first, but happy with Minoxidil",
                description:
                    "I was initially skeptical about hair growth products, but Minoxidil proved me wrong. With regular application over 6 months, my thinning patches are now covered with new hair growth.",
                name: "Rohit",
                age: 20,
                rating: 4.5,
            }
        ];

    return (
        <Section>
            <Row>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reviews.map((review, index) => (
                        <div
                            key={index}
                            className="rounded-[24px] border border-gray-200 bg-[#FAFAF5] p-4 shadow-sm overflow-hidden"
                        >
                            <div className="relative overflow-hidden rounded-[18px]">
                                <img
                                    src={review.image}
                                    alt={review.title}
                                    className="w-full h-[260px] object-cover"
                                />
                            </div>

                            <div className="mt-4">
                                <p className="text-[#163d7a] text-[15px] font-medium">
                                    {review.stage}
                                </p>

                                <h2 className="mt-2 text-[24px] font-bold text-[#0f2c5c]">
                                    {review.title}
                                </h2>

                                <p className="mt-3 text-gray-600 text-[16px] leading-7">
                                    {review.description}
                                </p>

                                <div className="mt-5 flex items-center gap-2">
                                    <span className="font-bold text-gray-800">
                                        {review.name}
                                    </span>

                                    <span className="text-gray-500">
                                        , {review.age}
                                    </span>

                                    <span className="text-green-500">🍀</span>

                                    <span className="text-yellow-500">★</span>

                                    <span className="font-semibold text-gray-700">
                                        {review.rating}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Row>
        </Section>
    );
}