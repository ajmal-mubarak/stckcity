from io import BytesIO
from decimal import Decimal

# pyrefly: ignore [missing-import]
from django.conf import settings

# pyrefly: ignore [missing-import]
from django.utils import timezone

from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch, mm

from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


def add_page_number(canvas, doc):
    page = canvas.getPageNumber()

    canvas.setFont(
        "Helvetica",
        9,
    )

    canvas.drawRightString(
        200 * mm,
        10 * mm,
        f"Page {page}",
    )


def generate_orders_pdf(queryset):

    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        rightMargin=30,
        leftMargin=30,
        topMargin=40,
        bottomMargin=30,
    )

    styles = getSampleStyleSheet()

    story = []

    # Company

    story.append(
        Paragraph(
            f"<b>{settings.COMPANY_NAME}</b>",
            styles["Title"],
        )
    )

    story.append(
        Paragraph(
            settings.COMPANY_ADDRESS,
            styles["Normal"],
        )
    )

    story.append(
        Paragraph(
            settings.COMPANY_PHONE,
            styles["Normal"],
        )
    )

    story.append(
        Paragraph(
            settings.COMPANY_EMAIL,
            styles["Normal"],
        )
    )

    story.append(Spacer(1, 0.2 * inch))

    # Report Title

    story.append(
        Paragraph(
            "<b>Orders Report</b>",
            styles["Heading1"],
        )
    )

    story.append(
        Paragraph(
            timezone.now().strftime(
                "Generated : %d-%m-%Y %I:%M %p"
            ),
            styles["Normal"],
        )
    )

    story.append(
        Paragraph(
            f"Total Orders : {queryset.count()}",
            styles["Normal"],
        )
    )

    story.append(Spacer(1, 0.3 * inch))

    data = [
        [
            "Order No",
            "Shop",
            "Status",
            "Total",
        ]
    ]

    grand_total = Decimal("0.00")

    for order in queryset:

        grand_total += order.total_amount

        data.append(
            [
                order.order_number,
                order.shop_name,
                order.status,
                f"₹ {order.total_amount}",
            ]
        )

    table = Table(data)

    table.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    colors.HexColor("#0d6efd"),
                ),
                (
                    "TEXTCOLOR",
                    (0, 0),
                    (-1, 0),
                    colors.white,
                ),
                (
                    "FONTNAME",
                    (0, 0),
                    (-1, 0),
                    "Helvetica-Bold",
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    1,
                    colors.grey,
                ),
                (
                    "ALIGN",
                    (0, 0),
                    (-1, -1),
                    "CENTER",
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, 0),
                    8,
                ),
            ]
        )
    )

    story.append(table)

    story.append(Spacer(1, 0.3 * inch))

    story.append(
        Paragraph(
            f"<b>Grand Total : ₹ {grand_total}</b>",
            styles["Heading2"],
        )
    )

    doc.build(
        story,
        onFirstPage=add_page_number,
        onLaterPages=add_page_number,
    )

    pdf = buffer.getvalue()

    buffer.close()

    return pdf

def generate_shop_history_pdf(shop, orders):

    from io import BytesIO
    from decimal import Decimal

    buffer = BytesIO()

    doc = SimpleDocTemplate(buffer)

    styles = getSampleStyleSheet()

    story = []

    story.append(
        Paragraph(
            "<b>Shop History Report</b>",
            styles["Title"],
        )
    )

    story.append(
        Paragraph(
            f"Shop : {shop.shop_name}",
            styles["Heading2"],
        )
    )

    story.append(
        Paragraph(
            f"Owner : {shop.owner_name}",
            styles["Normal"],
        )
    )

    story.append(
        Paragraph(
            f"Mobile : {shop.user.mobile_number}",
            styles["Normal"],
        )
    )

    story.append(
        Paragraph(
            f"Place : {shop.place}",
            styles["Normal"],
        )
    )

    story.append(Spacer(1, 15))

    data = [
        [
            "Order No",
            "Date",
            "Status",
            "Total",
        ]
    ]

    total = Decimal("0.00")

    for order in orders:

        total += order.total_amount

        data.append([
            order.order_number,
            order.created_at.strftime("%d-%m-%Y"),
            order.status,
            f"₹ {order.total_amount}",
        ])

    table = Table(data)

    table.setStyle(
        TableStyle([
            ("BACKGROUND", (0,0), (-1,0), colors.grey),
            ("TEXTCOLOR", (0,0), (-1,0), colors.white),
            ("GRID", (0,0), (-1,-1), 1, colors.black),
            ("ALIGN", (0,0), (-1,-1), "CENTER"),
        ])
    )

    story.append(table)

    story.append(Spacer(1,20))

    story.append(
        Paragraph(
            f"<b>Total Orders :</b> {orders.count()}",
            styles["Heading2"],
        )
    )

    story.append(
        Paragraph(
            f"<b>Total Purchase :</b> ₹ {total}",
            styles["Heading2"],
        )
    )

    doc.build(
        story,
        onFirstPage=add_page_number,
        onLaterPages=add_page_number,
    )

    pdf = buffer.getvalue()

    buffer.close()

    return pdf