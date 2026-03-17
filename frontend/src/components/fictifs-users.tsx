"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type User = {
  id: number
  fullname: string
  email: string
  phone: string
  role: "client" | "Employé" | "manager" | "admin"
  status: "en attente" | "actif"
  created_at: string
}

const sampleUsers: User[] = [
  {
    id: 1,
    fullname: "Hery Tina",
    email: "herytina@gmail.com",
    phone: "+261 34 12 345 67",
    role: "Employé",
    status: "en attente",
    created_at: "2025-08-01",
  },
  {
    id: 2,
    fullname: "Marie Randria",
    email: "marie.randria@example.com",
    phone: "+261 32 45 678 90",
    role: "Employé",
    status: "actif",
    created_at: "2025-07-15",
  },
]

export default function UsersDashboard() {
  const [users, setUsers] = useState<User[]>(sampleUsers)

  const handleValidate = (id: number) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: "actif" } : u))
    )
  }

  const handleReject = (id: number) => {
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }

  return (
    <Card className="p-4">
      <CardContent>
        <h2 className="text-xl font-bold mb-4">Tableau de bord - Utilisateurs</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nom complet</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.fullname}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  {user.status === "en attente" ? (
                    <span className="text-yellow-600 font-medium">En attente</span>
                  ) : (
                    <span className="text-green-600 font-medium">Actif</span>
                  )}
                </TableCell>
                <TableCell className="space-x-2">
                  {user.status === "en attente" ? (
                    <>
                      <Button size="sm" onClick={() => handleValidate(user.id)}>
                        Valider
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleReject(user.id)}>
                        Rejeter
                      </Button>
                    </>
                  ) : (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">Voir</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Détails utilisateur</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2">
                          <p><strong>Nom:</strong> {user.fullname}</p>
                          <p><strong>Email:</strong> {user.email}</p>
                          <p><strong>Téléphone:</strong> {user.phone}</p>
                          <p><strong>Rôle:</strong> {user.role}</p>
                          <p><strong>Date de création:</strong> {user.created_at}</p>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
