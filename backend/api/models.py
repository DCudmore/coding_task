from django.db import models

class Item(models.Model):
	class Group(models.TextChoices):
		PRIMARY = 'Primary', 'Primary Group'
		SECONDARY = 'Secondary', 'Secondary Group'

	name = models.CharField(max_length=255)
	group = models.CharField(
		max_length=20,
		choices=Group.choices,
	)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		# Enforce unique item name within each group
		unique_together = ['name', 'group']
		verbose_name = "Item"
		verbose_name_plural = "Items"
		ordering = ['-created_at']

	def __str__(self):
		return f"{self.name} ({self.group})"