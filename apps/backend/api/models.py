from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    created_at = models.DateTimeField(_("created at"), auto_now_add=True)
    modified_at = models.DateTimeField(_("modified at"), auto_now=True)

    class Meta:
        db_table = "users"
        verbose_name = _("user")
        verbose_name_plural = _("users")

    def __str__(self):
        return self.email if self.email else self.username


class RFQ(models.Model):
    partnumber = models.CharField(_("part number"), max_length=255)
    brand = models.CharField(_("brand"), max_length=255, blank=True, default="")
    qty = models.PositiveIntegerField(_("quantity"), default=1)
    target_price = models.DecimalField(
        _("target price"), max_digits=12, decimal_places=2, null=True, blank=True
    )
    created_at = models.DateTimeField(_("created at"), auto_now_add=True)
    modified_at = models.DateTimeField(_("modified at"), auto_now=True)

    class Meta:
        db_table = "rfqs"
        verbose_name = _("RFQ")
        verbose_name_plural = _("RFQs")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.partnumber} ({self.brand}) x{self.qty}"


class RFQ(models.Model):
    partnumber = models.CharField(_("part number"), max_length=255)
    brand = models.CharField(_("brand"), max_length=255)
    qty = models.PositiveIntegerField(_("quantity"))
    target_price = models.DecimalField(
        _("target price"), max_digits=12, decimal_places=2, null=True, blank=True
    )
    created_at = models.DateTimeField(_("created at"), auto_now_add=True)
    modified_at = models.DateTimeField(_("modified at"), auto_now=True)

    class Meta:
        db_table = "rfqs"
        verbose_name = _("RFQ")
        verbose_name_plural = _("RFQs")

    def __str__(self):
        return f"{self.partnumber} / {self.brand} x{self.qty}"
